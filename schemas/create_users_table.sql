CREATE TABLE users
(
	id VARCHAR(36) PRIMARY KEY,
	email VARCHAR(255) UNIQUE,
	refreshToken VARCHAR(1024),
	createdDate TIMESTAMP DEFAULT Now()
);