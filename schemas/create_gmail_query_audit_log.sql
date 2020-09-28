CREATE TABLE gmail_query_audit_log
(
	user_id VARCHAR(36),
	populateId VARCHAR(36),
	searchId VARCHAR(36),
	emailCount INT,
	searchFilter text,
	createdDate TIMESTAMP DEFAULT Now()
);