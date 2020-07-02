CREATE TABLE newsletters
(
	id VARCHAR(36) PRIMARY KEY,
	name VARCHAR(255),
	authorEmail VARCHAR(320),
	authorName VARCHAR(255),
	thirdpartyId VARCHAR(255), -- id of substack newsletter or sth 
	UNIQUE KEY (authorEmail)
);