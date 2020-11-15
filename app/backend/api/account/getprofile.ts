import { Context } from 'Http';
import { Gmail } from 'Utils';
import { Response } from 'Http';
import { User } from 'Repos';

const hasValidRefreshToken = async (user: User.User) => {
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
  const { id: userId } = await ctxt.getAppUser();
  if (userId) {
    const dbUser = await User.getById(userId);
    if (!dbUser) {
      res.json({});
      return;
    }

    const user = {
      id: userId,
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
