import { createConnection, createPool } from 'mysql2';

import Knex from 'knex';

type Connection = {
  beginTransaction: () => Promise<void>;
  commit: () => Promise<void>;
  end: () => Promise<void>;
  execute: (query: string, args: unknown[]) => Promise<unknown[]>;
};

interface Database {
  query: (query: string, values?: unknown) => Promise<unknown[]>;
  connection: () => Promise<Connection>;
}

const pool = createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const query = async (query: string, values?: unknown): Promise<unknown[]> => {
  const data = await pool.promise().query(query, values);
  return data;
};

const connection = async (): Promise<Connection> => {
  return await createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  }).promise();
};

const database: Database = {
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

export type { Connection };
export { database, knex };
