import { Context } from 'Http';
import { Response } from 'Http';
import { database } from 'Utils';

const queryNewsletters = async ({ userId }: Record<string, string>) => {
  // TODO(sagar): this will hide publisher with originalContent is NULL. just dont count digest with originalContent but still show the publisher
  const [rows] = await database.query(
    `SELECT n.id, n.name, n.authorName, n.authorEmail, COUNT(ue.unread) as totalDigests, CAST(SUM(ue.unread) AS UNSIGNED) as totalUnread
     FROM newsletters n
     LEFT JOIN user_emails ue ON ue.newsletter_id = n.id
     WHERE n.visible = 1 AND ue.originalContent IS NOT NULL AND ue.is_newsletter = 1 AND ue.user_id IN (?)
     GROUP BY n.id`,
    [userId]
  );
  return rows;
};

const listNewsletters = async (ctxt: Context, res: Response): Promise<void> => {
  const { id: userId } = await ctxt.getAppUser();

  const newsletters = await queryNewsletters({ userId });
  res.json(newsletters);
};

export default listNewsletters;
