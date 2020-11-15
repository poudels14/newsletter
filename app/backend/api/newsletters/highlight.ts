import {
  clearHighlight,
  deserializeRange,
  highlight as domHighlighter,
} from 'highlighter';

import { Base64 } from 'js-base64';
import { Context } from 'Http';
import { JSDOM } from 'jsdom';
import { Response } from 'Http';
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

const saveHighlight = ({
  id,
  userId,
  digestId,
  content,
}: {
  id: string;
  userId: string;
  digestId: string;
  content: string;
}): Promise<void> => {
  return knex('highlights').insert({
    id,
    user_id: userId,
    digest_id: digestId,
    content,
  });
};

const deleteHighlight = (highlightId: string): Promise<void> => {
  return knex('highlights').where({ id: highlightId }).delete();
};

const highlight = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await ctxt.getAppUser();

  const {
    action,
    newsletterId,
    digestId,
    range: serializedRange,
    highlightId,
    dataset,
    content,
  } = ctxt.body;
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

  if (action === 'highlight') {
    const range = deserializeRange(
      serializedRange,
      shadow,
      dom.window.document
    );
    domHighlighter(range, dom.window.document, highlightId, dataset);
    await saveHighlight({ id: highlightId, userId, digestId, content });
  } else if (action === 'clearHighlight') {
    clearHighlight(`.${highlightId}`, shadow);
    await deleteHighlight(highlightId);
  }

  saveDigestContent({ id: digestId, content: Base64.encode(shadow.innerHTML) });

  res.send('done');
};

export default highlight;
