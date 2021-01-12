import { Context } from 'Http';
import { Response } from 'Http';
import { knex } from 'Utils';
import lo from 'lodash';

const updateDigestConfig = async (
  ctxt: Context,
  res: Response
): Promise<void> => {
  const { id: userId } = await ctxt.getAppUser();
  if (userId) {
    const { digestId, config } = ctxt.body;

    const rows = await knex('user_emails')
      .select('config')
      .where({ id: digestId });
    const currentConfig = rows[0]?.config;

    if (!currentConfig) {
      return res.json({ error: "Couldn't get current config" });
    }
    const updatedConfig = lo.pick(
      {
        ...currentConfig,
        ...config,
      },
      ['liked']
    );
    await knex('user_emails')
      .where({ id: digestId })
      .update({ config: JSON.stringify(updatedConfig) });

    res.json({ success: true });
    return;
  }
  res.json({ error: 'Login required' });
};

export default updateDigestConfig;
