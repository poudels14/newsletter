import { Base64 } from 'js-base64';
import { Context } from 'Http/request';
import { Cookies } from 'Http/cookies';
import { JSDOM } from 'jsdom';
import { Response } from 'Http/response';
import { knex } from 'Utils';
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
  offset = 0,
}: Record<string, unknown>) => {
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
    .offset(offset)
    .orderBy('receivedDate', 'desc')
    .limit(10);
};

const listDigests = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await Cookies.getUser(ctxt);
  const filters = JSON.parse(ctxt.query.filters);
  const offset = ctxt.query.offset;

  const digests = (
    await queryDigests({
      userId,
      newsletterId: filters.newsletterId,
      offset,
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
  res.json(digests);
};

export default listDigests;
