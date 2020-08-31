import { Context } from 'Http/request';
import { Cookies } from 'Http/cookies';
import { Promise } from 'bluebird';
import { Response } from 'Http/response';
import { User } from 'Repos';

const getPopulatingStatus = async (
  ctxt: Context,
  res: Response
): Promise<void> => {
  const { id: userId } = await Cookies.getUser(ctxt);
  const user = await User.getById(userId);

  res.json({
    inProgress: user.gmailQueryInProgress,
    lastUpdated: user.lastGmailQueryDate,
  });
};

export default getPopulatingStatus;
