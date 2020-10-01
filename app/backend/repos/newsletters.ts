import { database, knex } from 'Utils';

type GmailQueryAuditLog = {
  user_id: string;
  populateId: string;
  searchId: string;
  emailCount: number;
  searchFilter: string;
  createdDate?: string;
};

type EmailHeaders = {
  email_id: string;
  sender: string;
  deliveredTo: string;
  toAddress: string;
  fromAddress: string;
  listUrl: string;
  listOwner: string;
  listPost: string;
  replyTo: string;
  listId: string;
  base64Headers: string;
};

type Digest = {
  id: string;
  newsletterId: string;
  userId: string;
  isNewsetter: boolean;
  title: string;
  receiverEmail: string;
  receivedDate: string;
  gmailId: string;
  content: string;
};

type Newsletter = {
  id: string;
  name?: string;
  authorEmail?: string;
  authorName?: string;
  thirdpartyId?: string;
  visible?: boolean;
  verified?: boolean;
};

type ListGmailQueryFilters = () => Promise<string[]>;
const listGmailQueryFilters: ListGmailQueryFilters = async () => {
  return (await knex('gmail_newsletter_filters').select('filter')).map(
    (r: { filter: string }) => r.filter
  );
};

type ListSubscribedNewsletters = (
  userId: string
) => Promise<Record<string, string>>;
const listSubscribedNewsletters: ListSubscribedNewsletters = async (userId) => {
  return await knex('newsletters')
    .leftJoin('user_emails', 'user_emails.newsletter_id', 'newsletters.id')
    .distinct('newsletters.authorEmail')
    .where({ 'user_emails.user_id': userId });
};

type AddGmailQueryAuditLog = (log: GmailQueryAuditLog) => Promise<void>;
const addGmailQueryAuditLog: AddGmailQueryAuditLog = (log) => {
  return knex('gmail_query_audit_log').insert(log);
};

type InsertEmailHeaders = (log: EmailHeaders) => Promise<void>;
const insertEmailHeaders: InsertEmailHeaders = (emailHeaders) => {
  return knex('email_headers').insert(emailHeaders);
};

type InsertDigest = (digest: Digest) => Promise<unknown>;
const insertDigest: InsertDigest = (digest) => {
  return database.query(
    `INSERT INTO user_emails(id, newsletter_id, user_id, is_newsletter, title, receiverEmail, receivedDate, gmailId, content)
     VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE gmailId=?`,
    [
      digest.id,
      digest.newsletterId,
      digest.userId,
      digest.isNewsetter,
      digest.title,
      digest.receiverEmail,
      digest.receivedDate,
      digest.gmailId,
      digest.content,
      digest.gmailId,
    ]
  );
};

type GetNewsletterByEmail = (email: string) => Promise<Newsletter>;
const getNewsletterByEmail: GetNewsletterByEmail = async (email) => {
  const [
    rows,
  ] = await database.query(
    `SELECT * FROM newsletters WHERE authorEmail = ? LIMIT 1`,
    [email]
  );
  return rows[0];
};

type InsertNewsletter = (newsletter: Newsletter) => Promise<void>;
const insertNewsletter: InsertNewsletter = async (newsletter) => {
  const [rows] = await database.query(
    `INSERT INTO newsletters(id, name, authorEmail, authorName, thirdpartyId, visible)
    VALUES(?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE authorEmail=?`,
    [
      newsletter.id,
      newsletter.name,
      newsletter.authorEmail,
      newsletter.authorName,
      newsletter.thirdpartyId,
      newsletter.visible,
      newsletter.authorEmail,
    ]
  );
  return rows[0];
};

export {
  listGmailQueryFilters,
  listSubscribedNewsletters,
  addGmailQueryAuditLog,
  insertEmailHeaders,
  insertDigest,
  getNewsletterByEmail,
  insertNewsletter,
};
