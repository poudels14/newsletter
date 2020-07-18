import * as Gmail from 'Utils/gmail';
import * as datefns from 'date-fns';
import * as uuid from 'uuid';

import { Context } from 'Http/request';
import { Cookies } from 'Http/cookies';
import { Promise } from 'bluebird';
import { Response } from 'Http/response';
import { database } from 'Utils';
import forge from 'node-forge';
import hash from '@emotion/hash';
import { parser } from './parser';
import { storage } from './storage';

const KNOWN_NEWSLETTERS_FILTERS = [
  'from:substack.com',
  'from:stratechery.com',
  'from: dailydigest@atom.finance',
];
// TODO(sagar): make sure the list is very specific before onboarding users

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
}: any) => {
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
  contentUrl,
}: any) => {
  return database.query(
    `INSERT INTO user_emails(id, newsletter_id, user_id, is_newsletter, title, receiverEmail, receivedDate, gmailId, contentUrl)
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
      contentUrl,
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

const uploadNewsletter = async (
  userId: string,
  newsletterId: string,
  newsletterBase64: string,
  html: string
) => {
  const sha256 = forge.md.sha256.create();
  sha256.update(newsletterBase64);
  const contentHash = sha256.digest().toHex();
  const digestUri = await storage.store(
    `${userId}/${newsletterId}/${contentHash}.html`,
    html
  );
  return digestUri;
};

const loadAndStoreGmail = async (
  client: any,
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

    const digestUri = await uploadNewsletter(
      userId,
      newsletterId,
      newsletter.base64,
      newsletter.html
    );
    await insertUserEmail({
      id: emailId,
      newsletterId,
      userId,
      isNewsetter: true,
      title: headers.subject,
      receiverEmail: headers.to,
      receivedDate: datefns.formatISO9075(new Date(headers.date)),
      gmailId: `gmail_${gmailId}`,
      contentUrl: digestUri,
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
  const allloaders = gmailIds.map(async (emailId: any) => {
    return await loadAndStoreGmail(client, userId, emailId);
  });
  await Promise.all(allloaders).catch((err: any) => console.log(err));
};

const populate = async (ctxt: Context, res: Response) => {
  const { id: userId } = await Cookies.getUser(ctxt);
  const user = await getUser(userId);
  if (!user) {
    res.sendStatus(403);
    return;
  }

  const client = Gmail.getClient({ refresh_token: user?.refreshToken });

  const allLoaders = KNOWN_NEWSLETTERS_FILTERS.map(async (filter) => {
    console.log('Loading emails from filter:', filter);

    let emails = await Gmail.searchEmails(client, {
      // q=in:sent after:1388552400 before:1391230800
      q: filter,
      // maxResults: 100,
    });

    await loadAndStoreGmails(
      client,
      userId,
      emails.messages?.map((e: any) => e.id)
    );
    while (emails.next) {
      console.log('emails.next = ', emails.next);
      emails = await emails.next();
      await loadAndStoreGmails(
        client,
        userId,
        emails.messages?.map((e: any) => e.id)
      );
    }
  });

  await Promise.all(allLoaders).catch((err: any) => console.log(err));

  console.log('sending request');
  res.send('Populating newsletters...');
};

export default populate;
