import * as Gmail from 'Utils/gmail';
import * as datefns from 'date-fns';
import * as uuid from 'uuid';

import { database, knex } from 'Utils';

import { Context } from 'Http/request';
import { Cookies } from 'Http/cookies';
import { Promise } from 'bluebird';
import { Response } from 'Http/response';
import hash from '@emotion/hash';
import { parser } from './parser';

const listFilters = () => {
  return knex('gmail_newsletter_filters').select('*');
};

const insertEmailHeaders = ({
  emailId,
  sender,
  deliveredTo,
  toAddress,
  fromAddress,
  listUrl,
  listOwner,
  listPost,
  replyTo,
  listId,
  base64Headers,
}: Record<string, unknown>) => {
  return database.query(
    `INSERT INTO email_headers(email_id, sender, deliveredTo, toAddress, fromAddress, listUrl, listOwner, listPost, replyTo, listId, base64Headers)
     VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     `,
    [
      emailId,
      sender,
      deliveredTo,
      toAddress,
      fromAddress,
      listUrl,
      listOwner,
      listPost,
      replyTo,
      listId,
      base64Headers,
    ]
  );
};

const insertUserEmail = ({
  id,
  newsletterId,
  userId,
  isNewsetter,
  title,
  receiverEmail,
  receivedDate,
  gmailId,
  content,
}: Record<string, unknown>) => {
  return database.query(
    `INSERT INTO user_emails(id, newsletter_id, user_id, is_newsletter, title, receiverEmail, receivedDate, gmailId, content)
     VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE gmailId=?`,
    [
      id,
      newsletterId,
      userId,
      isNewsetter,
      title,
      receiverEmail,
      receivedDate,
      gmailId,
      content,
      gmailId,
    ]
  );
};

const getNewsletter = async (email: string) => {
  const [
    rows,
  ] = await database.query(
    `SELECT * FROM newsletters WHERE authorEmail = ? LIMIT 1`,
    [email]
  );
  return rows[0];
};

const insertNewsletter = async (
  id: string,
  name: string,
  authorEmail: string,
  authorName: string,
  thirdpartyId: string
) => {
  const [rows] = await database.query(
    `INSERT INTO newsletters(id, name, authorEmail, authorName, thirdpartyId)
    VALUES(?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE authorEmail=?`,
    [id, name, authorEmail, authorName, thirdpartyId, authorEmail]
  );
  return rows[0];
};

const getUser = async (userId: string) => {
  const [rows] = await database.query(`SELECT * FROM users WHERE id = ?`, [
    userId,
  ]);
  return rows[0];
};

const loadAndStoreGmail = async (
  client: google.OAuthClient,
  userId: string,
  gmailId: string
) => {
  const email = await Gmail.getEmail(client, gmailId);

  const headers = parser.gmail.parseHeaders(gmailId, email.payload?.headers);
  const newsletter = parser.gmail.parseNewsletter(email.payload);

  try {
    const emailId = uuid.v1();
    const sender = headers.sender || headers.from; //? headers.sender : headers.from; // TODO(sagar): maybe we shouldn't parse from?
    const {
      name: senderName,
      email: senderEmail,
    } = parser.gmail.parseEmailAddress(sender);

    const dbNewsletter = await getNewsletter(senderEmail);
    const newsletterId = dbNewsletter?.id || hash(uuid.v1());
    if (!dbNewsletter) {
      await insertNewsletter(
        newsletterId,
        senderName, // Note(sagar): it's hard to get newsletter name automatically, set this to correct value when the newsletter is verified
        senderEmail,
        senderName,
        parser.gmail.parseEmailAddress(headers.listId)?.email
      ).catch((err) => {
        console.error(err);
        throw err;
      });
    }

    await insertUserEmail({
      id: emailId,
      newsletterId,
      userId,
      isNewsetter: true,
      title: headers.subject,
      receiverEmail: headers.to,
      receivedDate: datefns.formatISO9075(new Date(headers.date)),
      gmailId: `gmail_${gmailId}`,
      content: newsletter.base64,
    });
    await insertEmailHeaders({
      emailId,
      sender: headers.sender,
      deliveredTo: headers.deliveredTo,
      toAddress: headers.to,
      fromAddress: headers.from,
      listUrl: headers.listUrl,
      listOwner: headers.listOwner,
      listPost: headers.listPost,
      replyTo: headers.replyTo,
      listId: headers.listId,
      base64Headers: headers.base64Headers,
    });

    return email.id;
  } catch (err) {
    console.error(err);
    return email.id;
  }
};

const loadAndStoreGmails = async (
  client: string,
  userId: string,
  gmailIds: string[]
) => {
  if (!gmailIds) {
    return;
  }
  const allloaders = gmailIds.map(async (emailId: string) => {
    return await loadAndStoreGmail(client, userId, emailId);
  });
  await Promise.all(allloaders).catch((err: Error) => console.log(err));
};

const populate = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await Cookies.getUser(ctxt);
  const user = await getUser(userId);

  if (!user) {
    res.sendStatus(403);
    return;
  }

  const client = Gmail.getClient({ refresh_token: user?.refreshToken });

  const allLoaders = (await listFilters()).map(
    async ({ filter }: Record<string, unknown>) => {
      console.log('Loading emails from filter:', filter);

      let emails = await Gmail.searchEmails(client, {
        // q=in:sent after:1388552400 before:1391230800
        q: filter,
        // maxResults: 100,
      });

      await loadAndStoreGmails(
        client,
        userId,
        emails.messages?.map((e: Record<string, string>) => e.id)
      );
      while (emails.next) {
        console.log('emails.next = ', emails.next);
        emails = await emails.next();
        await loadAndStoreGmails(
          client,
          userId,
          emails.messages?.map((e: Record<string, string>) => e.id)
        );
      }
    }
  );

  await Promise.all(allLoaders).catch((err: Error) => console.log(err));

  console.log('sending request');
  res.send('Populating newsletters...');
};

export default populate;
