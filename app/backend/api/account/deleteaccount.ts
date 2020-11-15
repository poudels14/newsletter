import { MysqlConnection, database } from 'Utils';

import { Context } from 'Http';
import { Gmail } from 'Utils';
import { Response } from 'Http';
import { User } from 'Repos';

const unlinkGmail = async (user: User.User) => {
  try {
    const client = Gmail.getClient({ refresh_token: user.refreshToken });
    await client.revokeToken(user.refreshToken);
  } catch (e) {
    // Note(sagar): DO nothing
  }
};

const deleteHighlights = async (
  connection: MysqlConnection,
  user: Record<string, unknown>
) => {
  await connection.execute(`DELETE FROM highlights WHERE user_id = ?`, [
    user.id,
  ]);
};

const deleteEmails = async (
  connection: MysqlConnection,
  user: Record<string, unknown>
) => {
  await connection.execute(
    `DELETE h FROM email_headers h LEFT JOIN user_emails ue ON h.email_id = ue.id WHERE ue.user_id = ?`,
    [user.id]
  );

  await connection.execute(`DELETE FROM user_emails WHERE user_id = ?`, [
    user.id,
  ]);
};

const deleteUser = async (
  connection: MysqlConnection,
  user: Record<string, unknown>
) => {
  await connection.execute(`DELETE FROM users WHERE id = ?`, [user.id]);
};

const deleteAccount = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await ctxt.getAppUser();
  if (userId) {
    const user = await User.getById(userId);
    if (!user) {
      res.sendStatus(400);
      return;
    }
    await unlinkGmail(user);

    const connection = await database.connection();
    await connection.beginTransaction();

    await deleteHighlights(connection, user);
    await deleteEmails(connection, user);
    await deleteUser(connection, user);

    await connection.commit();
    await connection.end();

    // TODO(sagar): delete mailgun routes

    res.json({ success: true });
    return;
  }
  res.json({ error: 'Unknown user' });
};

export default deleteAccount;
