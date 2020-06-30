CREATE TABLE user_emails
(
	id VARCHAR(36) PRIMARY KEY,
	newsletter_id VARCHAR(36),
	user_id VARCHAR(36),
	is_newsletter TINYINT(1),
	title VARCHAR(255),

	receiverEmail VARCHAR(255),
	receivedDate timestamp,
	gmailId VARCHAR(255),

	contentUrl VARCHAR(1024),

	UNIQUE KEY (gmailId),
	INDEX `is_newsletter_idx_1` (`is_newsletter`)
);