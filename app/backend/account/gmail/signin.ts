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

const signIn = async (ctxt: Context, res: Response) => {
  const { authenticationCode, scope } = ctxt.body;

  if (!Gmail.hasRequiredScopes(scope)) {
    return res.json({ success: false, error: 'Missing required scopes' });
  }

  if (!!authenticationCode) {
    try {
      const user = await Gmail.getUserInfo(authenticationCode);
      const dbUser = await getUser(user.email);

      if (!!dbUser) {
        // This is to make sure the refreshToken in the db is still valid
        // TODO(sagar): there might be better way to check this
        await Gmail.refreshAccessToken(dbUser['refreshtoken']);

        Cookies.setUser(res, { id: dbUser.id, exp: user.exp });
        res.json({ success: true });
      } else {
        res.json({ success: false, isUser: false });
      }
    } catch (err) {
      res.json({ success: false, error: 'Server error' });
    }
  } else {
    // The frontend might send error that Google Auth sent during authentication
    // for example, error is thrown if user abandons the signup
    // TODO(sagar): log the error for analytics
    console.log('Error: ', ctxt.body);
    res.json({ success: false, error: ctxt.body });
  }
};

export default signIn;
