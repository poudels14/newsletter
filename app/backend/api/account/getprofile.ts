import { Context } from 'Http/request';
import { Cookies } from 'Http/cookies';
import { Gmail } from 'Utils';
import { Response } from 'Http/response';
import { User } from 'Repos';

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
  if (userId) {
    const dbUser = await User.getById(userId);
    if (!dbUser) {
      res.json({});
      return;
    }

    const user = {
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      email: dbUser.email,
      hasRequiredAccess: await hasValidRefreshToken(dbUser),
      isAdmin: dbUser.isAdmin,
      settings: dbUser.settings,
    };
    res.json(user);
    return;
  }
  res.json({});
};

export default getProfile;
