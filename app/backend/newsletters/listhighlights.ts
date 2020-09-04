import { Context } from 'Http/request';
import { Cookies } from 'Http/cookies';
import { Response } from 'Http/response';
import { knex } from 'Utils';

const queryHighlights = async ({ userId }: Record<string, unknown>) => {
  return knex('highlights AS h')
    .select('h.id')
    .select('h.digest_id')
    .select('h.date')
    .select('h.content')
    .select('ue.newsletter_id')
    .select('ue.title')
    .leftJoin('user_emails AS ue', 'ue.id', 'h.digest_id')
    .where({ 'h.user_id': userId })
    .orderBy('date', 'desc')
    .limit(50);
};

const listHighlights = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await Cookies.getUser(ctxt);

  const highlights = (await queryHighlights({ userId })).map(
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
