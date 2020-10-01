import { database, knex } from 'Utils';

import { Context } from 'Http';
import { Cookies } from 'Http';
import { Response } from 'Http';
import { User } from 'Repos';
import { format as formatQuery } from 'sqlstring';
import { parser } from '../newsletters/parser';

const listGmailFilters = async () => {
  const rows = await knex('gmail_newsletter_filters').orderBy('id');
  return rows;
};

const addGmailFilter = async (filter: string) => {
  await database.query(
    formatQuery('INSERT IGNORE INTO gmail_newsletter_filters SET ?', [
      { filter },
    ])
  );
};

const execScript = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await Cookies.getUser(ctxt);
  if (!userId) {
    res.sendStatus(404);
    return;
  }

  const user = await User.getById(userId);
  if (!user.isAdmin) {
    res.sendStatus(404);
    return;
  }

  const { command, data } = ctxt.query;
  if (command === 'parseEmail') {
    res.json(parser.gmail.parseEmailAddress(data));
  } else if (command === 'listGmailFilters') {
    res.json(await listGmailFilters());
  } else if (command === 'addGmailFilter') {
    await addGmailFilter(data);
    res.json({ msg: `added filter: ${data}` });
  } else {
    res.json({ msg: `command not found: ${command}` });
  }
};

export default execScript;
