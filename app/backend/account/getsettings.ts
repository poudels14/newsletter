import * as Gmail from 'Utils/gmail';

import { Context } from 'Http/request';
import { Cookies } from 'Http/cookies';
import { Response } from 'Http/response';
import { User } from 'Repos';
import { database } from 'Utils';

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

const getUsersNewsletters = async (userId: string) => {
  const [rows] = await database.query(
    `SELECT n.id, n.name, n.authorName, n.authorEmail, COUNT(ue.unread) as totalDigests, CAST(SUM(ue.unread) AS UNSIGNED) as totalUnread
     FROM newsletters n
     LEFT JOIN user_emails ue ON ue.newsletter_id = n.id
     WHERE n.visible = 1 AND ue.user_id IN (?)
     GROUP BY n.id`,
    [userId]
  );
  return rows;
};

const settings = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await Cookies.getUser(ctxt);
  if (userId) {
    const dbUser = await User.getById(userId);

    const user = {
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      email: dbUser.email,
      hasRequiredAccess: await hasValidRefreshToken(dbUser),
      settings: dbUser.settings,
      mailgunEmail: dbUser.mailgunEmailId,
      newsletters: await getUsersNewsletters(userId),
    };
    res.json(user);
    return;
  }
  res.json({});
};

export default settings;
