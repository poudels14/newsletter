import * as uuid from 'uuid';

import { database, knex } from 'Utils';

import { Context } from 'Http';
import { Cookies } from 'Http';
import { GmailParser } from 'Utils';
import { Response } from 'Http';
import { User } from 'Repos';
import { format as formatQuery } from 'sqlstring';
import { rabbitmq } from 'Utils';

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
  await populateForAllUsers(filter);
};

const populateForAllUsers = async (newsletterFilter: string) => {
  const userIds = await knex('users')
    .select('id')
    .then((rows) => rows.map((row) => row.id));

  const { connection, channel, publish } = await rabbitmq({
    queue: 'gmail-import',
  });
  userIds.forEach((userId) =>
    publish(
      JSON.stringify({
        userId,
        populateId: uuid.v4(),
        newsletterFilters: [newsletterFilter],
        source: 'runCommand@admin',
      })
    )
  );
  await channel.close();
  await connection.close();
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
    res.json(GmailParser.parseEmailAddress(data as string));
  } else if (command === 'listGmailFilters') {
    res.json(await listGmailFilters());
  } else if (command === 'addGmailFilter') {
    await addGmailFilter(data as string);
    res.json({ msg: `added filter: ${data}` });
  } else if (command === 'populate') {
    await populateForAllUsers(data as string);
    res.json({ msg: `started populating for filter: ${data}` });
  } else {
    res.json({ msg: `command not found: ${command}` });
  }
};

export default execScript;
