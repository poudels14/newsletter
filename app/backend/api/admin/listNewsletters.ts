import { Context } from 'Http';
import { Cookies } from 'Http';
import { Response } from 'Http';
import { User } from 'Repos';
import { knex } from 'Utils';

const listNewsletters = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await Cookies.getUser(ctxt);
  if (!userId) {
    res.sendStatus(404);
    return;
  }

  const user = await User.getById(userId);
  if (!user.isAdmin) {
    res.sendStatus(404);
    return;
  }

  const newsletters = await knex('newsletters')
    .select('id')
    .select('name')
    .select('authorEmail')
    .select('authorName')
    .select('visible')
    .select('thirdpartyId')
    .where({});
  res.json(newsletters);
};

export default listNewsletters;
