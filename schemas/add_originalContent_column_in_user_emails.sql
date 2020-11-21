ALTER TABLE user_emails
ADD COLUMN originalContent LONGTEXT AFTER previewContent;