import { database, knex } from 'Utils';

import { Base64 } from 'js-base64';
import { Context } from 'Http/request';
import { Cookies } from 'Http/cookies';
import { JSDOM } from 'jsdom';
import { Response } from 'Http/response';
import lo from 'lodash';

/** This will replace multiple consecutive spaces with just one space */
/*eslint no-irregular-whitespace: ["error", { "skipRegExps": true }]*/
const sinceWhiteSpacing = (str: string) => {
  return str.replace(
    /[\u00A0\u1680​\u180e\u2000-\u2009\u200a​\u200b​\u202f\u205f​\u3000]/g,
    ''
  );
};

const queryDigests = async ({
  userId,
  newsletterId,
}: Record<string, string>) => {
  const filter = lo.omitBy(
    {
      user_id: userId,
      newsletter_id: newsletterId,
    },
    lo.isUndefined
  );

  return knex('user_emails')
    .select('*')
    .where(filter)
    .orderBy('receivedDate', 'desc')
    .limit(10);
};

const queryNewsletters = async ({ newsletterIds }: Record<string, unknown>) => {
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

const listDigests = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await Cookies.getUser(ctxt);
  const filters = JSON.parse(ctxt.query.filters);

  const digests = (
    await queryDigests({
      userId,
      newsletterId: filters.newsletterId,
    })
  ).map((d: Record<string, unknown>) => {
    const { id } = d;
    const newsletterId = d['newsletter_id'];
    const html = Base64.decode(d.content);

    const dom = new JSDOM(html);
    const images = Array.from(
      dom.window.document.getElementsByTagName('img')
    ).filter((img) => img.width > 200);
    const previewImage = lo.nth(images, images.length / 2)?.src;
    return {
      id,
      newsletterId,
      title: d.title,
      receivedDate: d.receivedDate,
      contentUrl: `/api/newsletters/view/${newsletterId}/${id}`,
      previewImage,
      previewContent: sinceWhiteSpacing(
        dom.window.document.body.textContent
      ).substr(0, 250),
      read: !d.unread,
    };
  });
  const groupedDigests = lo.groupBy(
    digests,
    (digest: Record<string, unknown>) => digest.newsletterId
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
    lo.groupBy(
      newsletterDigests,
      (digest: Record<string, string>) => digest['id']
    ),
    (v: Record<string, string>) => {
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
