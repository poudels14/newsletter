import * as Gmail from 'Utils/gmail';

import { Context } from 'Http/request';
import { Cookies } from 'Http/cookies';
import { Response } from 'Http/response';
import { knex } from 'Utils';

const getUser = async (id: string) => {
  const rows = await knex('users')
    .select('firstName')
    .select('lastName')
    .select('email')
    .select('refreshToken')
    .where({ id });
  return rows[0];
};

const hasValidRefreshToken = async (user: Record<string, string>) => {
  if (user['refreshToken']) {
    try {
      await Gmail.refreshAccessToken(user['refreshToken']);
      return true;
    } catch (err) {
      console.error(err);
    }
  }
  return false;
};

const getProfile = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await Cookies.getUser(ctxt);
  let user = {};
  if (userId) {
    const dbUser = await getUser(userId);
    user = {
      ...user,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      email: dbUser.email,
      hasRequiredAccess: await hasValidRefreshToken(dbUser),
    };
  }
  res.json(user);
};

export default getProfile;
