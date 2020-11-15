import { Context } from 'Http';
import { Response } from 'Http';
import { User } from 'Repos';

const updateSettings = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await ctxt.getAppUser();
  if (userId) {
    const { settings } = ctxt.body;

    await User.updateSettings(userId, settings as Record<string, unknown>);
    res.json({ success: true });
    return;
  }
  res.json({ error: 'Unknown user' });
};

export default updateSettings;
