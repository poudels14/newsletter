import * as datefns from 'date-fns';
import * as uuid from 'uuid';

import { Channel, Message } from 'amqplib';
import { Newsletters, User } from 'Repos';

import { Auth } from 'googleapis';
import { Gmail } from 'Utils';
import { GmailParser } from 'Utils';
import Promise from 'bluebird';
import hash from '@emotion/hash';

const loadAndStoreGmail = async (
  client: Auth.OAuth2Client,
  userId: string,
  gmailId: string
) => {
  const email = await Gmail.getEmail(client, gmailId);

  const headers = GmailParser.parseHeaders(gmailId, email.payload?.headers);
  const newsletter = GmailParser.parseNewsletter(email.payload);

  try {
    const emailId = uuid.v4();
    const sender = headers.from || headers.sender; //? headers.sender : headers.from; // TODO(sagar): maybe we shouldn't parse from?
    const {
      name: senderName,
      email: senderEmail,
    } = GmailParser.parseEmailAddress(sender);

    const dbNewsletter = await Newsletters.getNewsletterByEmail(senderEmail);
    const newsletterId = dbNewsletter?.id || hash(uuid.v4());
    const visible = !!senderName || !!senderEmail;
    if (!dbNewsletter) {
      await Newsletters.insertNewsletter({
        id: newsletterId,
        name: senderName, // Note(sagar): it's hard to get newsletter name automatically, set this to correct value when the newsletter is verified
        authorEmail: senderEmail,
        authorName: senderName,
        thirdpartyId: GmailParser.parseEmailAddress(headers.listId)?.email,
        visible,
      }).catch((err: Error) => {
        console.error(err);
      });
    }

    await Newsletters.insertDigest({
      id: emailId,
      newsletterId,
      userId,
      isNewsetter: newsletter.base64 && visible,
      title: headers.subject,
      receiverEmail: headers.to,
      receivedDate: datefns.formatISO9075(new Date(headers.date)),
      gmailId: `gmail_${gmailId}`,
      originalContent: newsletter.base64,
    });
    await Newsletters.insertEmailHeaders({
      email_id: emailId,
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
  client: Auth.OAuth2Client,
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
  client: Auth.OAuth2Client,
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
      await Newsletters.addGmailQueryAuditLog({
        user_id: userId,
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

interface ProcessRequest {
  message: Message;
  channel: Channel;
}
type Process = (req: ProcessRequest) => void;
const process: Process = async ({ message, channel }) => {
  const { userId, populateId, lastPopulated, newsletterFilters } = JSON.parse(
    message.content.toString()
  );
  console.log(`populate request id: ${populateId}`);

  const user = await User.getById(userId);
  const populatedDate = new Date(); // next time, the emails will be loaded after this timestamp for the user
  const client = Gmail.getClient({ refresh_token: user.refreshToken });

  try {
    if (lastPopulated) {
      // if the user isn't new, search for email from the newsletters that the user already has and those that arrived
      // after the last search time

      const lastQueryDateInSeconds = Math.floor(lastPopulated / 1000);
      const userEmailFilters = await Newsletters.listSubscribedNewsletters(
        userId
      );
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
      const gmailSearchFilters =
        newsletterFilters || (await Newsletters.listGmailQueryFilters());
      await searchAndPopulate(client, userId, populateId, gmailSearchFilters);
    }
  } catch (e) {
    // Note(sagar): if there was any error when populating, set the queryInProgress to 0
    //              but don't set the last populated date
    console.error(e);
    await User.update(userId, { gmailQueryInProgress: false });
    return;
  }

  await User.update(userId, {
    gmailQueryInProgress: false,
    lastGmailQueryDate: populatedDate,
  });

  channel.ack(message);
};

export default process;
