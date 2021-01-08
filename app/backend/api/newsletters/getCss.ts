import { Context } from 'Http';
import { Response } from 'Http';
import { knex } from 'Utils';
import { rem } from 'polished';

const getCss = async (ctxt: Context, res: Response): Promise<void> => {
  const { digestId } = ctxt.params;

  const cssType = 'cleanStyle'; //type === 'clean' ? 'cleanStyle' : 'originalStyle';
  // const cssType = 'originalStyle';
  const rows = await knex('user_emails')
    .select(cssType)
    .where({ id: digestId });

  let css = rows[0][cssType];
  css = css.concat(`
    a {
      color:inherit;
      text-decoration:underline;
    }
    * {
      text-align: justify;
    }
  `);

  console.log('rem = ', rem('16px'));

  res.set('Content-Type', 'text/css');
  res.send(css);
};

export default getCss;
