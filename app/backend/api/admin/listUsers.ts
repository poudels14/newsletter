import { Context } from 'Http';
import { Response } from 'Http';
import { User } from 'Repos';

const listUsers = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await ctxt.getAppUser();
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
