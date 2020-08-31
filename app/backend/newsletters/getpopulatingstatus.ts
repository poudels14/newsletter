import { Context } from 'Http/request';
import { Cookies } from 'Http/cookies';
import { Promise } from 'bluebird';
import { Response } from 'Http/response';
import { knex } from 'Utils';

const getPopulatingStatus = async (
  ctxt: Context,
  res: Response
): Promise<void> => {
  const { id: userId } = await Cookies.getUser(ctxt);
  const rows = await knex('users')
    .select('lastGmailQueryDate')
    .select('gmailQueryInProgress')
    .where({ id: userId });

  res.json({
    inProgress: rows[0].gmailQueryInProgress,
    lastUpdated: rows[0].lastGmailQueryDate,
  });
};

export default getPopulatingStatus;
