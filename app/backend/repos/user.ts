import { crypto, knex } from 'Utils';

const ADMIN_EMAILS = ['poudels14@gmail.com'];

const buildUser = (dbUser: Record<string, unknown>) => {
  if (!dbUser) {
    return null;
  }
  let refreshToken = dbUser?.refreshToken;

  const isAdmin = ADMIN_EMAILS.find((admin) => admin === dbUser?.email);
  if (refreshToken) {
    refreshToken = crypto.decrypt(
      dbUser.refreshToken,
      process.env.GMAIL_REFRESH_TOKEN_ENCRYPTION_KEY
    );
  }
  return {
    ...dbUser,
    refreshToken,
    isAdmin: isAdmin && isAdmin !== undefined,
  };
};

type GetById = (userId: string) => Promise<Record<string, unknown>>;
const getById: GetById = async (userId) => {
  const rows = await knex('users').select('*').where({ id: userId });
  return buildUser(rows[0]);
};

type GetByEmail = (email: string) => Promise<Record<string, unknown>>;
const getByEmail: GetByEmail = async (email) => {
  const rows = await knex('users').select('*').where({ email });
  return buildUser(rows[0]);
};

type ListUsers = ({
  filter,
  limit,
}: {
  filter: Record<string, unknown>;
  limit: number;
}) => Promise<Record<string, unknown>[]>;
const listUsers: ListUsers = async ({ filter, limit }) => {
  const rows = await knex('users')
    .select('firstName')
    .select('lastName')
    .select('email')
    .where(filter || {})
    .modify((queryBuilder: unknown) => {
      if (limit) {
        queryBuilder.limit(limit);
      }
    });
  return rows.map(buildUser);
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

const clearRefreshToken = async (userId: string) => {
  return await knex('users')
    .where({ id: userId })
    .update({
      refreshToken: knex.raw('DEFAULT'),
    });
};

export { getById, getByEmail, listUsers, update, clearRefreshToken };
