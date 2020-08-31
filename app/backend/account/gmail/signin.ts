import * as Gmail from 'Utils/gmail';
import * as uuid from 'uuid';

import { database, knex } from 'Utils';

import { Context } from 'Http/request';
import { Cookies } from 'Http/cookies';
import { Response } from 'Http/response';

const getUser = async (email: string) => {
  const [rows] = await database.query(`SELECT * FROM users WHERE email = ?`, [
    email,
  ]);
  return rows[0];
};

const addUser = async ({
  id,
  email,
  firstName,
  lastName,
}: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}) => {
  await database.query(
    `INSERT INTO users(id, email, firstName, lastName) VALUES(?, ?, ?, ?) 
     ON DUPLICATE KEY UPDATE email=email`,
    [id, email, firstName, lastName]
  );
};

const updateName = async ({
  id,
  firstName,
  lastName,
}: {
  id: string;
  firstName: string;
  lastName: string;
}) => {
  await knex('users').where({ id }).update({ firstName, lastName });
};

const signIn = async (ctxt: Context, res: Response): Promise<void> => {
  const { authenticationCode, scope } = ctxt.body;

  if (authenticationCode) {
    try {
      const user = await Gmail.getUserInfo(authenticationCode);
      const dbUser = await getUser(user.email);

      const userId = dbUser?.id || uuid.v1();
      let response = {};

      if (dbUser) {
        // Note(sagar): update user's name in each signin
        updateName({
          id: dbUser.id,
          firstName: user['given_name'] || dbUser.firstName,
          lastName: user['family_name'] || dbUser.lastName,
        });

        if (!Gmail.hasRequiredScopes(scope)) {
          response = { hasRequiredAccess: false };
        } else {
          // This is to make sure the refreshToken in the db is still valid
          // TODO(sagar): there might be better way to check this
          try {
            await Gmail.refreshAccessToken(dbUser['refreshToken']);
            response = { hasRequiredAccess: true };
          } catch (err) {
            console.error('Error: ', err);
            response = { hasRequiredAccess: false };
          }
        }
      } else {
        // add user info to db if it's a new user
        await addUser({
          id: userId,
          email: user.email,
          firstName: user['given_name'] || '',
          lastName: user['family_name'] || '',
        });
      }

      // set login cookie and send response
      Cookies.setUser(res, { id: userId });
      res.json({ ...response, signedIn: true });
    } catch (err) {
      console.error('Error: ', err);
      res.sendStatus(503);
    }
  } else {
    // The frontend might send error that Google Auth sent during authentication
    // for example, error is thrown if user abandons the signup
    // TODO(sagar): log the error for analytics
    console.error('Error: ', ctxt.body);
    res.sendStatus(400);
  }
};

export default signIn;
