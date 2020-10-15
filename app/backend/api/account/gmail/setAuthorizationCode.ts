import * as uuid from 'uuid';

import { crypto, database } from 'Utils';

import { Context } from 'Http';
import { Cookies } from 'Http';
import { Gmail } from 'Utils';
import { Response } from 'Http';
import { User } from 'Repos';

const insertUserInfoToDb = ({
  id,
  email,
  refreshtoken,
}: {
  id: string;
  email: string;
  refreshtoken: string;
}) => {
  return database.query(
    `INSERT INTO users(id, email, refreshToken) VALUES(?, ?, ?) 
     ON DUPLICATE KEY UPDATE refreshToken=?`,
    [id, email, refreshtoken, refreshtoken]
  );
};

const setAuthorizationCode = async (
  ctxt: Context,
  res: Response
): Promise<void> => {
  const { code } = ctxt.body;

  // Note(sagar): even if the use is not in our system, calling the method
  //              will auto sign-up the user
  if (code) {
    const token = (await Gmail.getToken(code as string)) as Record<
      string,
      string
    >;
    const user = await Gmail.getUserInfo(token['id_token']);

    const { id: userId } = await Cookies.getUser(ctxt);

    const id = userId || uuid.v1();
    await insertUserInfoToDb({
      id,
      email: user.email,
      refreshtoken: crypto.encrypt(
        token['refresh_token'],
        process.env.GMAIL_REFRESH_TOKEN_ENCRYPTION_KEY
      ),
    });

    await User.updateSettings(userId, { gmailLinkingSkipped: false });

    Cookies.setUser(res, { id, exp: user.exp });
    res.json({ success: true });
  } else {
    // The frontend might send error that Google Auth sent during authentication
    // for example, error is thrown if user abandons the signup
    // TODO(sagar): log the error for analytics
    console.error('Error: ', ctxt.body);
    res.json({ success: false });
  }
};

export default setAuthorizationCode;
