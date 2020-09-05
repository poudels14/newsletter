ALTER TABLE user_emails
ADD COLUMN previewImage VARCHAR(2048) AFTER gmailId;

ALTER TABLE user_emails
ADD COLUMN previewContent VARCHAR(500) AFTER previewImage;