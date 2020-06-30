import { google } from 'googleapis';
import lo from 'lodash';
import dotenv from 'dotenv';
dotenv.config();

const REQUIRED_SCOPES =
  'openid profile email https://www.googleapis.com/auth/gmail.readonly';

console.log(
  'process.env.GMAIL_REDIRECT_URL = ',
  process.env.GMAIL_REDIRECT_URL
);
const oAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URL
  );
};

const getClient: (credentials: object) => any = (credentials) => {
  const client = oAuth2Client();
  client.setCredentials(credentials);
  return client;
};

const getToken = async (code: string) => {
  return await oAuth2Client()
    .getToken(code)
    .then((res) => res.tokens);
};

const refreshAccessToken = async (refreshToken: string) => {
  const client = getClient({
    refresh_token: refreshToken,
    include_granted_scopes: true,
  });
  return await client.getAccessToken();
};

const hasRequiredScopes = (scopes: string[]) => {
  return lo.difference(REQUIRED_SCOPES, scopes).length === 0;
};

// Get user info from the JWT id_token received from `oAuth2Client.getToken`
const getUserInfo: (a: string) => object = async (idToken) => {
  const data = await oAuth2Client().verifyIdToken({
    idToken: idToken,
    audience: process.env.GMAIL_CLIENT_ID,
  });
  return data.getPayload();
};

interface SearchOptions {
  q?: string;
  maxResults?: number;
}
const searchEmails: (
  client: any,
  options: SearchOptions,
  pageToken?: string
) => any = async (client, options, pageToken) => {
  const gmail = google.gmail({ version: 'v1', auth: client });
  const { data: emails } = await gmail.users.messages.list({
    userId: 'me',
    ...options,
    pageToken,
  });

  const { nextPageToken } = emails;
  const next = nextPageToken
    ? async () => await searchEmails(client, options, nextPageToken)
    : null;

  return {
    ...emails,
    next,
  };
};

const getEmail = async (client: any, emailId: string) => {
  const gmail = google.gmail({ version: 'v1', auth: client });
  const { data } = await gmail.users.messages.get({
    userId: 'me',
    id: emailId,
  });

  return data;
};

export {
  getClient,
  getToken,
  refreshAccessToken,
  getUserInfo,
  hasRequiredScopes,
  searchEmails,
  getEmail,
};
