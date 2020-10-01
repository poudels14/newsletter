import { Context } from 'Http';
import { Cookies } from 'Http';
import { Response } from 'Http';
import { User } from 'Repos';
import { differenceInMinutes } from 'date-fns';

const populate = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await Cookies.getUser(ctxt);
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
    if (!shouldPopulate) {
      return;
    }
  }

  await User.update(userId, { gmailQueryInProgress: true });
  // TODO(sagar): publish rabbitmq message
  // publish({
  //   userId,
  //   populateId : uuid.v4(),
  // });
};

export default populate;
