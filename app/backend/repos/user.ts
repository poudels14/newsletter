import { crypto, knex } from 'Utils';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  refreshToken: string;
  lastGmailQueryDate?: Date;
  gmailQueryInProgress: boolean;
  isAdmin?: boolean;
  settings?: string;
  mailgunEmailId?: string;
  readwiseToken?: string;
};

const ADMIN_EMAILS = ['poudels14@gmail.com'];

type BuildUser = (user: User) => User;
const buildUser: BuildUser = (dbUser: User) => {
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

type GetById = (userId: string) => Promise<User>;
const getById: GetById = async (userId) => {
  const rows = await knex('users').select('*').where({ id: userId });
  return buildUser(rows[0]);
};

type GetByEmail = (email: string) => Promise<User>;
const getByEmail: GetByEmail = async (email) => {
  const rows = await knex('users').select('*').where({ email });
  return buildUser(rows[0]);
};

type ListUsers = ({
  filter,
  limit,
}: {
  filter?: Record<string, unknown>;
  limit?: number;
}) => Promise<User[]>;
const listUsers: ListUsers = async ({ filter, limit }) => {
  const rows = await knex('users')
    .select('id')
    .select('firstName')
    .select('lastName')
    .select('email')
    .where(filter || {})
    .modify((queryBuilder) => {
      if (limit) {
        queryBuilder.limit(limit);
      }
    });
  return rows.map(buildUser);
};

type Update = (userId: string, user: Partial<User>) => Promise<void>;
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

type UpdateSettings = (
  userId: string,
  settings: Record<string, unknown>
) => Promise<void>;
const updateSettings: UpdateSettings = async (userId, settings) => {
  const dbUser = await getById(userId);
  const updatedSettings = {
    ...dbUser.settings,
    ...settings,
  };

  await update(userId, {
    settings: JSON.stringify(updatedSettings),
  });
};

type ClearRefreshToken = (userId: string) => Promise<void>;
const clearRefreshToken: ClearRefreshToken = async (userId) => {
  return await knex('users')
    .where({ id: userId })
    .update({
      refreshToken: knex.raw('DEFAULT'),
    });
};

type SetReadwiseAccessToken = (
  userId: string,
  accessToken: string
) => Promise<void>;
const setReadwiseAccessToken: SetReadwiseAccessToken = async (
  userId,
  readwiseToken
) => {
  return await knex('users').where({ id: userId }).update({
    readwiseToken,
  });
};

export type { User };
export {
  getById,
  getByEmail,
  listUsers,
  update,
  updateSettings,
  clearRefreshToken,
  setReadwiseAccessToken,
};
