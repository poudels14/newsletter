import * as Gmail from 'Utils/gmail';
import * as datefns from 'date-fns';
import * as uuid from 'uuid';

import { database, knex } from 'Utils';

import { Context } from 'Http/request';
import { Cookies } from 'Http/cookies';
import { Promise } from 'bluebird';
import { Response } from 'Http/response';
import { User } from 'Repos';
import { differenceInMinutes } from 'date-fns';
import hash from '@emotion/hash';
import { parser } from './parser';

const listFilters = async () => {
  return (await knex('gmail_newsletter_filters').select('filter')).map(
    (r: { filter: string }) => r.filter
  );
};

const listSubscribedNewsletters = async (userId: string) => {
  return await knex('newsletters')
    .leftJoin('user_emails', 'user_emails.newsletter_id', 'newsletters.id')
    .distinct('newsletters.authorEmail')
    .where({ 'user_emails.user_id': userId });
};

const insertGmailQueryAuditLog = ({
  userId,
  populateId,
  searchId,
  emailCount,
  searchFilter,
  createdDate,
}: Record<string, unknown>) => {
  return knex('gmail_query_audit_log').insert({
    user_id: userId,
    populateId,
    searchId,
    emailCount,
    searchFilter,
    createdDate,
  });
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
  thirdpartyId: string,
  visible: boolean
) => {
  const [rows] = await database.query(
    `INSERT INTO newsletters(id, name, authorEmail, authorName, thirdpartyId, visible)
    VALUES(?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE authorEmail=?`,
    [id, name, authorEmail, authorName, thirdpartyId, visible, authorEmail]
  );
  return rows[0];
};

const updateLastQueryDate = ({
  userId,
  date,
}: {
  userId: string;
  date: Date;
}) => {
  return User.update(userId, {
    gmailQueryInProgress: 0,
    lastGmailQueryDate: date,
  });
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
    const emailId = uuid.v4();
    const sender = headers.from || headers.sender; //? headers.sender : headers.from; // TODO(sagar): maybe we shouldn't parse from?
    const {
      name: senderName,
      email: senderEmail,
    } = parser.gmail.parseEmailAddress(sender);

    const dbNewsletter = await getNewsletter(senderEmail);
    const newsletterId = dbNewsletter?.id || hash(uuid.v4());
    const visible = !!senderName || !!senderEmail;
    if (!dbNewsletter) {
      await insertNewsletter(
        newsletterId,
        senderName, // Note(sagar): it's hard to get newsletter name automatically, set this to correct value when the newsletter is verified
        senderEmail,
        senderName,
        parser.gmail.parseEmailAddress(headers.listId)?.email,
        visible
      ).catch((err) => {
        console.error(err);
      });
    }

    await insertUserEmail({
      id: emailId,
      newsletterId,
      userId,
      isNewsetter: visible,
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
  gmailIds: string[]
) => {
  if (!gmailIds) {
    return;
  }

  return Promise.each(gmailIds, async (emailId: string) => {
    return await loadAndStoreGmail(client, userId, emailId);
  });
};

const searchAndPopulate = async (
  client: google.OAuthClient,
  userId: string,
  populateId: string,
  filters: string[]
) => {
  const allLoaders = filters.map(async (filter: string) => {
    const searchId = uuid.v4();
    let emails = await Gmail.searchEmails(client, {
      q: filter,
    });
    while (emails) {
      await insertGmailQueryAuditLog({
        userId,
        populateId,
        searchId,
        emailCount: emails.messages?.length || 0,
        searchFilter: filter,
      });
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

const populate = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await Cookies.getUser(ctxt);
  const user = await User.getById(userId);

  if (!user) {
    res.sendStatus(403);
    return;
  } else {
    const { gmailQueryInProgress, lastGmailQueryDate } = user;

    // kick off populating process only if it's not already in progress and it's been atleast 2 minutes since last populate
    const shouldPopulate =
      !gmailQueryInProgress &&
      (!lastGmailQueryDate ||
        differenceInMinutes(new Date(), lastGmailQueryDate) >= 2);
    // Populating takes time, so return response before fetching emails from Gmail
    res.json({
      lastPopulated: lastGmailQueryDate,
      inProgress: gmailQueryInProgress || shouldPopulate,
    });
    if (!shouldPopulate) {
      return;
    }
  }

  await User.update(userId, { gmailQueryInProgress: 1 });
  const populatedDate = new Date(); // next time, the emails will be loaded after this timestamp for the user
  const client = Gmail.getClient({ refresh_token: user.refreshToken });
  const populateId = uuid.v4();

  try {
    if (user.lastGmailQueryDate) {
      // if the user isn't new, search for email from the newsletters that the user already has and those that arrived
      // after the last search time

      const lastQueryDateInSeconds = Math.floor(user.lastGmailQueryDate / 1000);
      const userEmailFilters = await listSubscribedNewsletters(userId);
      const gmailSearchFilters = userEmailFilters.map(
        ({ authorEmail }: { authorEmail: string }) => {
          return `from:${authorEmail} after:${lastQueryDateInSeconds}`;
        }
      );
      await searchAndPopulate(client, userId, populateId, gmailSearchFilters);
    } else {
      // it's faster to use email filters to fetch newsletters from email for the new user
      // since fetching all the emails in the Gmail and checking if it's newsletter is much slower because of the
      // quota per user that Gmail has
      const genericFilters = await listFilters();
      await searchAndPopulate(client, userId, populateId, genericFilters);
    }
  } catch (e) {
    // Note(sagar): if there was any error when populating, set the queryInProgress to 0
    //              but don't set the last populated date
    await User.update(userId, { gmailQueryInProgress: 0 });
    return;
  }

  await updateLastQueryDate({ userId, date: populatedDate });
};

export default populate;
