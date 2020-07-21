import * as Gmail from 'Utils/gmail';
import * as uuid from 'uuid';

import { Context } from 'Http/request';
import { Cookies } from 'Http/cookies';
import { Response } from 'Http/response';
import { database } from 'Utils';

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
    const token = await Gmail.getToken(code);
    const user = await Gmail.getUserInfo(token['id_token']);

    const { id: userId } = await Cookies.getUser(ctxt);

    const id = userId || uuid.v1();
    await insertUserInfoToDb({
      id,
      email: user.email,
      refreshtoken: token['refresh_token'],
    });

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
