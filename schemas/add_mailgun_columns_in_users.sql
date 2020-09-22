ALTER TABLE users
ADD COLUMN `mailgunEmailId` varchar(50) DEFAULT NULL UNIQUE,
ADD COLUMN `mailgunRouteId` varchar(50) DEFAULT NULL;