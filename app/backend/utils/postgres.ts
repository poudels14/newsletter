import { Pool } from 'pg';

console.log('Creating db pool...');

const pool = new Pool({
  host: 'tilt-postgres',
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: 'thereadingapp',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const query = async (query: string, values: any) => {
  const client = await pool.connect();
  const data = await client.query(query, values);
  client.release();
  return data;
};

const database = {
  query,
};

export { database };
