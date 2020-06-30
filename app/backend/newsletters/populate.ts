import forge from 'node-forge';
import * as uuid from 'uuid';
import * as datefns from 'date-fns';

import { Context } from 'Http/request';
import { Response } from 'Http/response';
import { Cookies } from 'Http/cookies';
import { database } from 'Utils';
import * as Gmail from 'Utils/gmail';

import { parser } from './parser';
import { storage } from './storage';

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
     VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
  console.log(
    'inserting newsletter =',
    id,
    name,
    authorEmail,
    authorName,
    thirdpartyId
  );
  const [rows] = await database.query(
    `INSERT INTO newsletters(id, name, authorEmail, authorName, thirdpartyId)
    VALUES(?, ?, ?, ?, ?)`,
    [id, name, authorEmail, authorName, thirdpartyId]
  );
  return rows[0];
};

const getUser = async (userId: string) => {
  const [rows] = await database.query(`SELECT * FROM users WHERE id = ?`, [
    userId,
  ]);
  return rows[0];
};

const newsletterId = '333333';

const loadAndStoreGmail = async (
  client: any,
  userId: string,
  gmailId: string
) => {
  let email = await Gmail.getEmail(client, gmailId);

  const headers = parser.gmail.parseHeaders(gmailId, email.payload?.headers);
  const newsletter = parser.gmail.parseNewsletter(email.payload);

  // console.log("base64 email length =", newsletter);
  const sha256 = forge.md.sha256.create();
  sha256.update(newsletter.base64);
  const contentHash = sha256.digest().toHex();
  const digestUri = await storage.store(
    `${userId}/${newsletterId}/${contentHash}.html`,
    newsletter.html
  );

  try {
    const emailId = uuid.v1();
    const {
      name: senderName,
      email: senderEmail,
    } = parser.gmail.parseEmailAddress(headers.sender);

    const dbNewsletter = await getNewsletter(senderEmail);
    const newsletterId = dbNewsletter?.id || uuid.v1();
    if (!!!dbNewsletter) {
      console.log('Newsletter not found, adding a new one!');
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
  } catch (err) {
    console.error(err);
  }
};

const populate = async (ctxt: Context, res: Response) => {
  const { id: userId } = await Cookies.getUser(ctxt);
  const user = await getUser(userId);

  const client = Gmail.getClient({ refresh_token: user['refreshtoken'] });
  let emails = await Gmail.searchEmails(client, {
    q: 'substack.com',
    maxResults: 100,
  });

  emails.messages.forEach((email: any) => {
    loadAndStoreGmail(client, userId, email.id);
  });

  res.send('Populating newsletters...');
};

export default populate;
