CREATE TABLE email_headers
(
	email_id VARCHAR(36) PRIMARY KEY,
	
	sender VARCHAR(320),
	deliveredTo VARCHAR(320),
	toAddress VARCHAR(320),
	fromAddress VARCHAR(320),
	
	listUrl VARCHAR(1024),
	listOwner VARCHAR(1024),
	listPost VARCHAR(1024),
	replyTo VARCHAR(1024),
	listId VARCHAR(1024),
	base64Headers TEXT
);