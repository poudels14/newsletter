import lo from 'lodash';

import { Context } from 'Http/request';
import { Response } from 'Http/response';
import { database, knex } from 'Utils';
import { Cookies } from 'Http/cookies';

const queryNewsletters = async ({ userId }: any) => {
  const [
    rows,
  ] = await database.query(
    `SELECT DISTINCT n.id, n.name, n.authorName, n.authorEmail FROM newsletters n LEFT JOIN user_emails ue ON ue.newsletter_id = n.id WHERE ue.user_id IN (?)`,
    [userId]
  );
  return rows;
};

const listNewsletters = async (ctxt: Context, res: Response) => {
  const { id: userId } = await Cookies.getUser(ctxt);

  const newsletters = await queryNewsletters({ userId });
  res.json(newsletters);
};

export default listNewsletters;
