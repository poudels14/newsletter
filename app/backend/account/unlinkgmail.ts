import * as Gmail from 'Utils/gmail';

import { Context } from 'Http/request';
import { Cookies } from 'Http/cookies';
import { Response } from 'Http/response';
import { User } from 'Repos';
import { knex } from 'Utils';

const unlinkGmail = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await Cookies.getUser(ctxt);
  if (userId) {
    const user = await User.getById(userId);
    if (!user) {
      res.sendStatus(400);
      return;
    }
    const client = Gmail.getClient({ refresh_token: user.refreshToken });

    await client.revokeToken(user.refreshToken);
    User.clearRefreshToken(userId);

    res.json({ success: true });
    return;
  }
  res.json({ error: 'Unknown user' });
};

export default unlinkGmail;
