import * as uuid from 'uuid';

import { Context } from 'Http';
import { Response } from 'Http';
import { User } from 'Repos';
import { differenceInMinutes } from 'date-fns';
import { rabbitmq } from 'Utils';

const populate = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await ctxt.getAppUser();
  const user = await User.getById(userId);

  if (!user) {
    res.sendStatus(403);
    return;
  } else {
    const { gmailQueryInProgress, lastGmailQueryDate } = user;

    // kick off populating process only if it's not already in progress and it's been atleast 2 minutes since last populate
    const shouldPopulate =
      !gmailQueryInProgress &&
      (!lastGmailQueryDate ||
        differenceInMinutes(new Date(), lastGmailQueryDate) >= 2);
    // Populating takes time, so return response before fetching emails from Gmail
    res.json({
      lastPopulated: lastGmailQueryDate,
      inProgress: gmailQueryInProgress || shouldPopulate,
    });
    if (shouldPopulate) {
      const { connection, channel, publish } = await rabbitmq({
        queue: 'gmail-import',
      });
      publish(
        JSON.stringify({
          userId,
          populateId: uuid.v4(),
          lastPopulated: lastGmailQueryDate?.getTime(),
          source: 'api',
        })
      );
      await channel.close();
      await connection.close();

      await User.update(userId, { gmailQueryInProgress: true });
    }
  }
};

export default populate;
