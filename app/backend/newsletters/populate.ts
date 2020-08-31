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

const listFilters = async () => {
  return (await knex('gmail_newsletter_filters').select('filter')).map(
    (r: { filter: string }) => r.filter
  );
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

const updateLastQueryDate = async ({
  userId,
  date,
}: {
  userId: string;
  date: Date;
}) => {
  return await knex('users')
    .where({ id: userId })
    .update({ gmailQueryInProgress: 0, lastGmailQueryDate: date });
};

const loadAndStoreGmail = async (
  client: google.OAuthClient,
  userId: string,
  gmailId: string,
  filters?: string[]
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

    if (
      filters &&
      filters.filter((f) => senderEmail.indexOf(f) >= 0).length == 0
    ) {
      console.log('Email not matched with filter, from: ', senderEmail);
      return;
    }

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

const loadAndStoreGmails = (
  client: google.OAuthClient,
  userId: string,
  gmailIds: string[],
  filters?: string[]
) => {
  if (!gmailIds) {
    return;
  }

  return Promise.each(gmailIds, async (emailId: string) => {
    return await loadAndStoreGmail(client, userId, emailId, filters);
  });
};

const populateUsingFilters = async (
  client: google.OAuthClient,
  userId: string
) => {
  console.log(
    `populating newsletters using filters: ${JSON.stringify({ userId })}`
  );
  const allLoaders = (await listFilters()).map(async (filter: string) => {
    let emails = await Gmail.searchEmails(client, {
      q: filter,
    });
    while (emails) {
      await loadAndStoreGmails(
        client,
        userId,
        emails.messages?.map((e: Record<string, string>) => e.id)
      );
      if (!emails.next) {
        break;
      }
      emails = await emails.next();
    }
  });

  await Promise.all(allLoaders);
};

const populateEmailsAfterLastDate = async (
  client: google.OAuthClient,
  userId: string,
  lastQueryDate: number
) => {
  const lastQueryDateInSeconds = Math.floor(lastQueryDate / 1000);
  console.log(
    `populating new newsletters: ${JSON.stringify({
      userId,
      lastQueryDateInSeconds,
    })}`
  );
  let emails = await Gmail.searchEmails(client, {
    q: `after:${lastQueryDateInSeconds}`,
  });
  const emailFilters = (await listFilters()).map(
    (f: string) => f.substr(5) /* "from:" is 5 chars long */
  );
  while (emails) {
    await loadAndStoreGmails(
      client,
      userId,
      emails.messages?.map((e: Record<string, string>) => e.id),
      emailFilters
    );
    if (!emails.next) {
      break;
    }
    emails = await emails.next();
  }
};

const populate = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await Cookies.getUser(ctxt);
  const user = await getUser(userId);

  if (!user) {
    res.sendStatus(403);
    return;
  } else {
    // Populating takes time, so return response before fetching emails from Gmail
    res.json({ lastPopulated: user.lastGmailQueryDate, inProgress: true });
    // return;
  }

  await knex('users').where({ id: userId }).update({ gmailQueryInProgress: 1 });
  const populatedDate = new Date(); // next time, the emails will be loaded after this timestamp for the user
  const client = Gmail.getClient({ refresh_token: user?.refreshToken });

  if (user.lastGmailQueryDate) {
    // if the user isn't new, fetch all emails from the last popupated date
    // it might be fater to do that than searching using filters since there won't be
    // that many emails since that last populated date and the newsletter filters will be a long list
    await populateEmailsAfterLastDate(client, userId, user.lastGmailQueryDate);
  } else {
    // it's faster to use email filters to fetch newsletters from email for the new user
    // since fetching all the emails in the Gmail and checking if it's newsletter is much slower because of the
    // quota per user that Gmail has
    await populateUsingFilters(client, userId);
  }

  await updateLastQueryDate({ userId, date: populatedDate });

  console.log('done populating');
};

export default populate;
