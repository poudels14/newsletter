import { database, knex } from 'Utils';

import { Context } from 'Http/request';
import { Cookies } from 'Http/cookies';
import { Response } from 'Http/response';
import lo from 'lodash';

const queryDigests = async ({ userId, newsletterId }: any) => {
  const filter = lo.omitBy(
    {
      user_id: userId,
      newsletter_id: newsletterId,
    },
    lo.isUndefined
  );

  return knex('user_emails').select('*').where(filter);
};

const queryNewsletters = async ({ newsletterIds }: any) => {
  if (newsletterIds.length === 0) {
    return [];
  }
  const [
    rows,
  ] = await database.query(`SELECT * FROM newsletters WHERE id IN (?)`, [
    newsletterIds,
  ]);
  return rows;
};

const listDigests = async (ctxt: Context, res: Response) => {
  const { id: userId } = await Cookies.getUser(ctxt);
  const filters = JSON.parse(ctxt.query.filters);

  const digests = (
    await queryDigests({
      userId,
      newsletterId: filters.newsletterId,
    })
  ).map((d: any) => {
    return {
      id: d.id,
      newsletterId: d['newsletter_id'],
      title: d.title,
      receivedDate: d.receivedDate,
      contentUrl: d.contentUrl,
    };
  });
  const groupedDigests = lo.groupBy(
    digests,
    (digest: any) => digest.newsletterId
  );

  const newsletters = await queryNewsletters({
    newsletterIds: Object.keys(groupedDigests),
  });
  const newslettersById = lo.keyBy(newsletters, 'id');

  const newsletterDigests = Object.keys(newslettersById).map((newsletterId) => {
    const newsletter = newslettersById[newsletterId];
    return {
      id: newsletterId,
      name: newsletter.name,
      authorEmail: newsletter.authorEmail,
      authorName: newsletter.authorName,
      digests: groupedDigests[newsletterId],
    };
  });

  const groupedNewsletterDigests = lo.mapValues(
    lo.groupBy(newsletterDigests, (digest: any) => digest['id']),
    (v: any) => {
      const { name, authorEmail, authorName, digests } = v[0];
      return {
        name,
        authorEmail,
        authorName,
        digests,
      };
    }
  );
  res.json(groupedNewsletterDigests);
};

export default listDigests;
