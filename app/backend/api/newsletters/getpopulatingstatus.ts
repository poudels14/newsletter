import { Context } from 'Http';
import { Response } from 'Http';
import { User } from 'Repos';

const getPopulatingStatus = async (
  ctxt: Context,
  res: Response
): Promise<void> => {
  const { id: userId } = await ctxt.getAppUser();
  const user = await User.getById(userId);

  res.json({
    inProgress: user.gmailQueryInProgress,
    lastUpdated: user.lastGmailQueryDate,
  });
};

export default getPopulatingStatus;
