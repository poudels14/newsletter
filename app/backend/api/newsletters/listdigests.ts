import { Base64 } from 'js-base64';
import { Context } from 'Http';
import { Response } from 'Http';
import { knex } from 'Utils';
import lo from 'lodash';
import unified from 'unified';
import rehypeParse from 'rehype-parse';
import { selectAll } from 'hast-util-select';
import toTextContent from 'hast-util-to-text';

/** This will replace multiple consecutive spaces with just one space */
/*eslint no-irregular-whitespace: ["error", { "skipRegExps": true }]*/
const singleWhiteSpacing = (str: string) => {
  return str
    .replace(
      /[\u00A0\u1680​\u180e\u2000-\u2009\u200a​\u200b​\u202f\u205f​\u3000]/g,
      ''
    )
    .replace(/\s\s+/g, ' ')
    .trim();
};

const parseAndSavePreviewData = async (digestId: string) => {
  const rows = await knex('user_emails')
    .select('originalContent')
    .where({ id: digestId });

  const digestContent = rows[0].originalContent;

  const html = Base64.decode(digestContent);
  const htmlTree = unified().use(rehypeParse).parse(html);
  let previewImages = selectAll('meta', htmlTree)
    .filter((meta) =>
      ['og:image', 'twitter:image'].includes(meta.properties?.property)
    )
    .map((meta) => meta.properties?.content);
  if (previewImages.length < 1) {
    previewImages = selectAll('img', htmlTree)
      .filter((img) => img.properties?.width > 200)
      .map((img) => img.properties?.src);
  }

  const previewImage = lo.nth(previewImages, previewImages.length / 2);
  const previewContent = singleWhiteSpacing(toTextContent(htmlTree)).substr(
    0,
    250
  );

  // TODO(sagar): I am not convinced using knex prevents SQL injection. make sure that's the case
  await knex('user_emails').where({ id: digestId }).update({
    previewImage,
    previewContent,
  });

  return {
    previewImage,
    previewContent,
  };
};

const queryDigests = async ({
  userId,
  newsletterId,
  unread,
  isNewsletter,
  offset = 0,
  limit = 10,
}: Record<string, unknown>) => {
  const filter = lo.omitBy(
    {
      user_id: userId,
      newsletter_id: newsletterId,
      is_newsletter: isNewsletter,
      unread,
    },
    lo.isUndefined
  );

  return knex('user_emails AS ue')
    .select('ue.id')
    .select('ue.newsletter_id')
    .select('ue.receivedDate')
    .select('ue.title')
    .select('ue.previewImage')
    .select('ue.previewContent')
    .select('ue.unread')
    .select('ue.config')
    .leftJoin('newsletters AS n', 'n.id', 'ue.newsletter_id')
    .where('n.visible', 1)
    .where(filter)
    .whereNotNull('ue.originalContent')
    .offset(offset)
    .orderBy('receivedDate', 'desc')
    .limit(limit);
};

const listDigests = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await ctxt.getAppUser();
  const filters = JSON.parse(ctxt.query.filters);
  const offset = ctxt.query.offset;
  const limit = ctxt.query.limit || 10;

  const digests = await queryDigests({
    userId,
    newsletterId:
      filters.newsletterId === 'unknown' ? null : filters.newsletterId,
    isNewsletter: filters.newsletterId !== 'unknown',
    unread: filters.unreadOnly ? true : undefined,
    offset,
    limit,
  }).then((digests) => {
    return Promise.all(
      digests.map(async (d: Record<string, unknown>) => {
        const { id, previewImage, previewContent } = d;
        const newsletterId = d['newsletter_id'];

        let parsedPreviewImage, parsedPreviewContent;
        if (!previewImage && !previewContent) {
          const parsedData = await parseAndSavePreviewData(id);
          parsedPreviewImage = parsedData.previewImage;
          parsedPreviewContent = parsedData.previewContent;
        }

        return {
          id,
          newsletterId,
          title: d.title,
          receivedDate: d.receivedDate,
          contentUrl: `/api/newsletters/view/${newsletterId}/${id}`,
          previewImage: previewImage || parsedPreviewImage,
          previewContent: previewContent || parsedPreviewContent,
          read: !d.unread,
          config: d.config,
        };
      })
    );
  });

  res.json(digests);
};

export default listDigests;
