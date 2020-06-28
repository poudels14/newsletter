var Base64 = require('js-base64').Base64;
import * as uuid from 'uuid';

import { Context } from 'Http/request';
import { Response } from 'Http/response';
import { Cookies } from 'Http/cookies';
import { database } from 'Utils/postgres';
import * as Gmail from 'Authorize/gmail';

import { parser } from './parser';
import { storage } from './storage';

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

    // console.log("json: ", parsedEmail);
    const digestUri = await storage.store(
      `${id}/${newsletterId}/${uuid.v1()}.html`,
      Base64.decode(parsedEmail.digestContent)
    );
    console.log('digestUri =', digestUri);
  });

  res.send('Populating newsletters');
};

export default populate;
