CREATE TABLE highlights
(
  id VARCHAR(36),
  user_id VARCHAR(36),
  digest_id VARCHAR(36),
  date TIMESTAMP DEFAULT Now(),
  content VARCHAR(2400),
  INDEX `user_id_idx_1` (`user_id`)
);