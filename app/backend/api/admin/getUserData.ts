import { Context } from 'Http';
import { Response } from 'Http';
import { User } from 'Repos';

import listHighlights from '../newsletters/listhighlights';
import listNewsletters from '../newsletters/listnewsletters';
import listDigests from '../newsletters/listdigests';

const getUserData = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await ctxt.getAppUser();
  if (!userId) {
    res.sendStatus(404);
    return;
  }

  const user = await User.getById(userId);
  if (!user.isAdmin) {
    res.sendStatus(404);
    return;
  }

  const { userId: appUserId, command } = ctxt.params;
  const getAppUser = async () => {
    return {
      id: appUserId as string,
    };
  };

  if (command === 'listHighlights') {
    listHighlights(
      {
        ...ctxt,
        getAppUser,
        query: {
          filters: JSON.stringify({}),
        },
      },
      res
    );
  } else if (command === 'listNewsletters') {
    listNewsletters(
      {
        ...ctxt,
        getAppUser,
      },
      res
    );
  } else if (command === 'listDigests') {
    listDigests(
      {
        ...ctxt,
        getAppUser,
        query: {
          filters: JSON.stringify({}),
          offset: 0,
          limit: 1000,
        },
      },
      res
    );
  } else {
    res.json({ error: 'Command not found' });
  }
};

export default getUserData;
