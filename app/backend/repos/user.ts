import { crypto, knex } from 'Utils';

type GetById = (userId: string) => Promise<Record<string, unknown>>;
const getById: GetById = async (userId) => {
  const rows = await knex('users').select('*').where({ id: userId });
  const user = rows[0];
  let refreshToken = user?.refreshToken;
  if (refreshToken) {
    refreshToken = crypto.decrypt(
      user.refreshToken,
      process.env.GMAIL_REFRESH_TOKEN_ENCRYPTION_KEY
    );
  }
  return {
    ...user,
    refreshToken,
  };
};

type GetByEmail = (email: string) => Promise<Record<string, unknown>>;
const getByEmail: GetByEmail = async (email) => {
  const rows = await knex('users').select('*').where({ email });
  const user = rows[0];
  let refreshToken = user?.refreshToken;
  if (refreshToken) {
    refreshToken = crypto.decrypt(
      user.refreshToken,
      process.env.GMAIL_REFRESH_TOKEN_ENCRYPTION_KEY
    );
  }
  return {
    ...user,
    refreshToken,
  };
};

type Update = (userId: string, data: Record<string, unknown>) => Promise<void>;
const update: Update = async (userId, data) => {
  const finalRecord = data;
  if (data.refreshToken) {
    finalRecord.refreshToken = crypto.encrypt(
      data.refreshToken,
      process.env.GMAIL_REFRESH_TOKEN_ENCRYPTION_KEY
    );
  }
  return await knex('users').where({ id: userId }).update(finalRecord);
};

export { getById, getByEmail, update };
