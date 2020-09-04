ALTER TABLE user_emails ADD INDEX user_emails_idx2 (user_id);
ALTER TABLE user_emails ADD INDEX user_emails_idx3 (unread);
ALTER TABLE user_emails ADD INDEX user_emails_idx4 (newsletter_id);
