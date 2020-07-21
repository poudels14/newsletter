import { Context } from 'Http/request';
import { Cookies } from 'Http/cookies';
import { Response } from 'Http/response';
import { database } from 'Utils';

const queryNewsletters = async ({ userId }: Record<string, string>) => {
  const [
    rows,
  ] = await database.query(
    `SELECT DISTINCT n.id, n.name, n.authorName, n.authorEmail FROM newsletters n LEFT JOIN user_emails ue ON ue.newsletter_id = n.id WHERE ue.user_id IN (?)`,
    [userId]
  );
  return rows;
};

const listNewsletters = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await Cookies.getUser(ctxt);

  const newsletters = await queryNewsletters({ userId });
  res.json(newsletters);
};

export default listNewsletters;
