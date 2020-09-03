import { Context } from 'Http/request';
import { Cookies } from 'Http/cookies';
import { Response } from 'Http/response';
import { User } from 'Repos';

const listUsers = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await Cookies.getUser(ctxt);
  if (!userId) {
    res.sendStatus(404);
    return;
  }

  const user = await User.getById(userId);
  if (user.isAdmin) {
    res.json(await User.listUsers({}));
  } else {
    res.sendStatus(404);
  }
};

export default listUsers;
