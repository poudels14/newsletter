ALTER TABLE user_emails
ADD COLUMN originalStyle TEXT AFTER content,
ADD COLUMN cleanStyle TEXT AFTER originalStyle;