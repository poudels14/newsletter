import { GoogleApis, google } from 'googleapis';

import dotenv from 'dotenv';
import lo from 'lodash';

dotenv.config();

const REQUIRED_SCOPES =
  'openid profile email https://www.googleapis.com/auth/gmail.readonly';

const oAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URL
  );
};

type GmailClient = (credentials: unknown) => GoogleApis.OAuthClient;
const getClient: GmailClient = (credentials) => {
  const client = oAuth2Client();
  client.setCredentials(credentials);
  return client;
};

const getToken = async (code: string): Promise<unknown> => {
  return await oAuth2Client()
    .getToken(code)
    .then((res) => res.tokens);
};

const refreshAccessToken = async (refreshToken: string): Promise<unknown> => {
  const client = getClient({
    refresh_token: refreshToken,
    include_granted_scopes: true,
  });
  return await client.getAccessToken();
};

const hasRequiredScopes = (scopes: string[]): boolean => {
  return lo.difference(REQUIRED_SCOPES, scopes).length === 0;
};

// Get user info from the JWT id_token received from `oAuth2Client.getToken`
type GetUserInfo = (a: string) => Promise<unknown>;
const getUserInfo: GetUserInfo = async (idToken) => {
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
  client: google.OAuthClient,
  options: SearchOptions,
  pageToken?: string
) => unknown = async (client, options, pageToken) => {
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

const getEmail = async (
  client: google.OAuthClient,
  emailId: string
): Promise<unknown> => {
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
