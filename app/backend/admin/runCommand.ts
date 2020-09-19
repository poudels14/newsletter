import { Context } from 'Http/request';
import { Cookies } from 'Http/cookies';
import { Response } from 'Http/response';
import { User } from 'Repos';
import { parser } from '../newsletters/parser';

// import { knex } from 'Utils';

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

  const command = ctxt.query.command;
  if (command === 'parseEmail') {
    res.json(parser.gmail.parseEmailAddress(ctxt.query.data));
  }

  res.json({});
};

export default execScript;
