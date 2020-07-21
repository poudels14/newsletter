import { Base64 } from 'js-base64';
import { Context } from 'Http/request';
import { Cookies } from 'Http/cookies';
import { Response } from 'Http/response';
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

  const rows = await knex('user_emails').select('content').where(filter);
  return Base64.decode(rows[0].content);
};

const viewNewsletter = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await Cookies.getUser(ctxt);
  const { params } = ctxt;

  const digest = await queryDigestContent({
    userId,
    id: params.digestId,
    newsletterId: params.newsletterId,
  });

  res.send(digest);
};

export default viewNewsletter;
