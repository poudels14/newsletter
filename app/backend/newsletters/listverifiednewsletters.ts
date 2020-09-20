import { database, knex } from 'Utils';

import { Context } from 'Http/request';
import { Response } from 'Http/response';

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
