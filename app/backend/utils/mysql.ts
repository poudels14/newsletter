import { createConnection, createPool } from 'mysql2';

import Knex from 'knex';

console.log('Creating db pool...');

const pool = createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const query = async (query: string, values: unknown): Promise<unknown> => {
  const data = await pool.promise().query(query, values);
  return data;
};

const connection = async (): Promise<unknown> => {
  return await createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  }).promise();
};

const database = {
  query,
  connection,
};

const knex = Knex({
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
});

export { database, knex };
