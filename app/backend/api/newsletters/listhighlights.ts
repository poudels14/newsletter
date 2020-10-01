import { Context } from 'Http';
import { Cookies } from 'Http';
import { Response } from 'Http';
import { knex } from 'Utils';
import lo from 'lodash';

const queryHighlights = async (filters: Record<string, unknown>) => {
  return knex('highlights AS h')
    .select('h.id')
    .select('h.digest_id')
    .select('h.date')
    .select('h.content')
    .select('ue.newsletter_id')
    .select('ue.title')
    .leftJoin('user_emails AS ue', 'ue.id', 'h.digest_id')
    .where(filters)
    .orderBy('date', 'desc')
    .limit(50);
};

const listHighlights = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await Cookies.getUser(ctxt);

  const filters = JSON.parse(ctxt.query.filters);
  const queryFilters = lo.omitBy(
    {
      'h.user_id': userId,
      'ue.newsletter_id': filters?.newsletterId,
      'ue.unread': filters.unreadOnly ? true : undefined,
    },
    lo.isUndefined
  );

  const highlights = (await queryHighlights(queryFilters)).map(
    (highlight: Record<string, unknown>) => {
      const {
        id,
        digest_id: digestId,
        date,
        content,
        newsletter_id: newsletterId,
        title,
      } = highlight;

      return {
        id,
        newsletterId,
        digestId,
        date,
        content,
        title,
      };
    }
  );
  res.json(highlights);
};

export default listHighlights;
