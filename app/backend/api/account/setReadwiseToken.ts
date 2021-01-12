import { Context } from 'Http';
import { Response } from 'Http';
import { User } from 'Repos';
import { knex } from 'Utils';

const setReadwiseToken = async (
  ctxt: Context,
  res: Response
): Promise<void> => {
  const { id: userId } = await ctxt.getAppUser();
  if (userId) {
    const user = await User.getById(userId);
    if (!user) {
      res.sendStatus(400);
      return;
    }

    let { token } = ctxt.body;
    // Note(sagar): setting empty token will delete the token
    if (token === '') {
      token = knex.raw('DEFAULT');
    }
    User.setReadwiseAccessToken(userId, token);

    res.json({ success: true });
    return;
  }
  res.json({ error: 'Unknown user' });
};

export default setReadwiseToken;
