import { deserializeRange, highlight as domHighlighter } from 'highlighter';

import { Base64 } from 'js-base64';
import { Context } from 'Http/request';
import { Cookies } from 'Http/cookies';
import { JSDOM } from 'jsdom';
import { Response } from 'Http/response';
import { knex } from 'Utils';
import lo from 'lodash';

const queryDigestContent = async ({
  userId,
  newsletterId,
  id,
}: Record<string, string>): Promise<string> => {
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

const saveDigestContent = async ({
  id,
  content,
}: Record<string, string>): Promise<void> => {
  await knex('user_emails').where({ id }).update({ content });
};

const highlight = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await Cookies.getUser(ctxt);

  const { newsletterId, digestId, range: serializedRange } = ctxt.body;
  const digestHtml = await queryDigestContent({
    userId,
    id: digestId,
    newsletterId: newsletterId,
  });

  const dom = new JSDOM(
    `
    <!doctype html>
    <html>
      <body>
        <div id='shadow-host'>
          <div>Loading...</div>
        </div>
      </body>
    </html>`
  );
  const shadowHost = dom.window.document.getElementById('shadow-host');
  const shadow = shadowHost.attachShadow({ mode: 'open' });
  shadow.innerHTML = digestHtml;

  const range = deserializeRange(serializedRange, shadow, dom.window.document);
  domHighlighter(range, dom.window.document);

  saveDigestContent({ id: digestId, content: Base64.encode(shadow.innerHTML) });

  res.send('done');
};

export default highlight;
