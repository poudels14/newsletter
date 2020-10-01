import { Context } from 'Http';
import { Response } from 'Http';
import { knex } from 'Utils';

const listVerifiedNewsletters = async (
  ctxt: Context,
  res: Response
): Promise<void> => {
  const newsletters = await knex('newsletters')
    .select('name')
    .select('authorName')
    .where({ verified: true });
  res.json(newsletters);
};

export default listVerifiedNewsletters;
