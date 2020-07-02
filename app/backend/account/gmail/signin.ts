import * as uuid from 'uuid';
import { Context } from 'Http/request';
import { Response } from 'Http/response';
import { Cookies } from 'Http/cookies';
import { database } from 'Utils';

import * as Gmail from 'Utils/gmail';

const getUser = async (email: string) => {
  const [rows] = await database.query(`SELECT * FROM users WHERE email = ?`, [
    email,
  ]);
  return rows[0];
};

const addUser = async ({ id, email }: { id: string; email: string }) => {
  await database.query(
    `INSERT INTO users(id, email) VALUES(?, ?) 
     ON DUPLICATE KEY UPDATE email=email`,
    [id, email]
  );
};

const signIn = async (ctxt: Context, res: Response) => {
  const { authenticationCode, scope } = ctxt.body;

  if (authenticationCode) {
    try {
      const user = await Gmail.getUserInfo(authenticationCode);
      const dbUser = await getUser(user.email);

      const userId = dbUser?.id || uuid.v1();
      let response = {};

      if (dbUser) {
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
        await addUser({ id: userId, email: user.email });
      }

      // set login cookie and send response
      Cookies.setUser(res, { id: userId, exp: user.exp });
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
