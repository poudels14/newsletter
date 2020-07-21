import Knex from 'knex';
import { createPool } from 'mysql2';

console.log('Creating db pool...');

const pool = createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: 'thereadingapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const query = async (query: string, values: unknown): Promise<unknown> => {
  const data = await pool.promise().query(query, values);
  return data;
};

const database = {
  query,
};

const knex = Knex({
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: 'thereadingapp',
  },
});

export { database, knex };
