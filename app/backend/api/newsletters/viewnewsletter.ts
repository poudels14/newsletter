import { Base64 } from 'js-base64';
import { Context } from 'Http';
import { Response } from 'Http';
import { knex } from 'Utils';
import lo from 'lodash';

const queryDigestContent = async ({
  userId,
  newsletterId,
  id,
}: Record<string, unknown>): Promise<unknown> => {
  const filter = lo.omitBy(
    {
      id,
      user_id: userId,
      newsletter_id: newsletterId,
    },
    lo.isUndefined
  );

  const rows = await knex('user_emails')
    .select(knex.raw('COALESCE(content, originalContent) as content'))
    .where(filter);
  return Base64.decode(rows[0].content);
};

const markAsRead = async (id: string) => {
  await knex('user_emails').where({ id }).update({ unread: 0 });
};

const viewNewsletter = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await ctxt.getAppUser();
  const { params } = ctxt;

  const digest = await queryDigestContent({
    userId,
    id: params.digestId,
    newsletterId: params.newsletterId,
  });

  markAsRead(params.digestId);

  res.send(digest);
};

export default viewNewsletter;
