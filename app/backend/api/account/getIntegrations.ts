import { Context, Response } from 'Http';
import { Gmail } from 'Utils';
import { User } from 'Repos';
import _ from 'lodash';

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

const integrations = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await ctxt.getAppUser();
  let dbUser;
  if (userId) {
    dbUser = await User.getById(userId);
  }
  res.json({
    gmail: {
      id: 'gmail',
      icon: 'gmail',
      title: 'Gmail',
      description: 'Import newsletters from your Gmail',
      connected: !_.isNil(dbUser) && (await hasValidRefreshToken(dbUser)),
    },
    readwise: {
      id: 'readwise',
      icon: 'readwise',
      title: 'Readwise',
      description: 'Export your highlights to Readwise',
      connected: !_.isNil(dbUser?.readwiseToken),
    },
  });
};

export default integrations;
