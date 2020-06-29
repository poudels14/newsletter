var Base64 = require('js-base64').Base64;
import * as uuid from 'uuid';

import { Context } from 'Http/request';
import { Response } from 'Http/response';
import { Cookies } from 'Http/cookies';
import { database } from 'Utils';
import * as Gmail from 'Authorize/gmail';

import { parser } from './parser';
import { storage } from './storage';

const insertDigest = ({
  id,
  newsletterId,
  userId,
  title,
  receiverEmail,
  receivedDate,
  gmailId,
  contentUrl,
}: any) => {
  return database.query(
    `INSERT INTO newsletter_digests(id, newsletter_id, user_id, title, receiverEmail, receivedDate, gmailId, contentUrl)
     VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      id,
      newsletterId,
      userId,
      title,
      receiverEmail,
      receivedDate,
      gmailId,
      contentUrl,
    ]
  );
};

const getUser = async (userId: string) => {
  const res = await database.query(`SELECT * FROM users WHERE id = $1`, [
    userId,
  ]);
  return res.rows[0];
};

const newsletterId = '333333';
const digestId = '222222';

const populate = async (ctxt: Context, res: Response) => {
  const { id } = await Cookies.getUser(ctxt);
  const user = await getUser(id);

  const client = Gmail.getClient({ refresh_token: user['refreshtoken'] });
  let emails = await Gmail.searchEmails(client, {
    q: 'substack.com',
    maxResults: 100,
  });

  emails.messages.forEach(async (email: any) => {
    const { id: emailId } = email;
    let content = await Gmail.getEmail(client, emailId);

    const parsedEmail = parser.gmail.parse(content);

    const digestUri = await storage.store(
      `${id}/${newsletterId}/${uuid.v1()}.html`,
      Base64.decode(parsedEmail.digestContent)
    );
    console.log('digestUri =', digestUri);

    console.log('authorEmail =', parsedEmail.authorEmail);
    console.log('digestSenderEmail =', parsedEmail.digestSenderEmail);

    await insertDigest({
      id: uuid.v1(),
      newsletterId: 1,
      userId: id,
      title: parsedEmail.digestTitle,
      receiverEmail: parsedEmail.digestTo,
      receivedDate: parsedEmail.digestReceivedDate,
      gmailId: parsedEmail.digestGmailId,
      contentUrl: digestUri,
    });
  });

  res.send('Populating newsletters');
};

export default populate;
