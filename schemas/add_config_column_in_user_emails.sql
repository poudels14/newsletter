ALTER TABLE user_emails
ADD COLUMN config JSON DEFAULT (JSON_OBJECT());