import * as uuid from 'uuid';
import { Context } from 'Http/request';
import { Response } from 'Http/response';
import { Cookies } from 'Http/cookies';
import { database } from 'Utils/postgres';

import * as Gmail from 'Authorize/gmail';

const getUser = async (email: string) => {
  const res = await database.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);
  return res.rows[0];
};

const addUser = async ({ id, email }: any) => {
  await database.query(
    `INSERT INTO users(id, email) VALUES($1, $2) 
     ON CONFLICT (email) DO NOTHING`,
    [id, email]
  );
};

const signIn = async (ctxt: Context, res: Response) => {
  const { authenticationCode, scope } = ctxt.body;

  if (!!authenticationCode) {
    try {
      const user = await Gmail.getUserInfo(authenticationCode);
      const dbUser = await getUser(user.email);

      if (!!dbUser) {
        Cookies.setUser(res, { id: dbUser.id, exp: user.exp });
        const signedIn = true;

        // This is to make sure the refreshToken in the db is still valid
        // TODO(sagar): there might be better way to check this
        await Gmail.refreshAccessToken(dbUser['refreshtoken']).catch(() =>
          res.json({ signedIn, hasRequiredAccess: false })
        );
        res.json({ signedIn, hasRequiredAccess: true });
      } else {
        // add user info to db if it's a new user
        await addUser({ id: uuid.v1(), email: user.email });
        res.json({ signedIn: true });
      }
    } catch (err) {
      console.log('Error: ', err);
      res.sendStatus(503);
    }
  } else {
    // The frontend might send error that Google Auth sent during authentication
    // for example, error is thrown if user abandons the signup
    // TODO(sagar): log the error for analytics
    console.log('Error: ', ctxt.body);
    res.sendStatus(400);
  }
};

export default signIn;
