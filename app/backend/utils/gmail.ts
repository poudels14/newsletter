import { Auth, google } from 'googleapis';
import { Credentials, TokenPayload } from 'google-auth-library';

import { GetAccessTokenResponse } from 'google-auth-library/build/src/auth/oauth2client';
import dotenv from 'dotenv';
import lo from 'lodash';

dotenv.config();

const REQUIRED_SCOPES =
  'openid profile email https://www.googleapis.com/auth/gmail.readonly';

type BuildOAuth2Client = () => Auth.OAuth2Client;
const buildOAuth2Client: BuildOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URL
  );
};

type GmailClient = (credentials: unknown) => Auth.OAuth2Client;
const getClient: GmailClient = (credentials) => {
  const client = buildOAuth2Client();
  client.setCredentials(credentials);
  return client;
};

type GetToken = (code: string) => Promise<string | Credentials>;
const getToken: GetToken = async (code) => {
  return await buildOAuth2Client()
    .getToken(code)
    .then((res) => res.tokens);
};

type RefreshToken = (refreshToken: string) => Promise<GetAccessTokenResponse>;
const refreshAccessToken: RefreshToken = async (refreshToken) => {
  const client = getClient({
    refresh_token: refreshToken,
    include_granted_scopes: true,
  });
  return await client.getAccessToken();
};

type HasRequiredScopes = (scopes: string[]) => boolean;
const hasRequiredScopes: HasRequiredScopes = (scopes) => {
  return lo.difference(REQUIRED_SCOPES, scopes).length === 0;
};

// Get user info from the JWT id_token received from `oAuth2Client.getToken`
type GetUserInfo = (a: string) => Promise<TokenPayload>;
const getUserInfo: GetUserInfo = async (idToken) => {
  const data = await buildOAuth2Client().verifyIdToken({
    idToken: idToken,
    audience: process.env.GMAIL_CLIENT_ID,
  });
  return data.getPayload();
};

interface SearchOptions {
  q?: string;
  maxResults?: number;
}
interface SearchEmailsResponse {
  messages?: unknown;
  nextPageToken?: string;
  resultSizeEstimate?: number;
  next: () => Promise<SearchEmailsResponse>;
}
type SearchEmails = (
  client: Auth.OAuth2Client,
  options: SearchOptions,
  pageToken?: string
) => Promise<SearchEmailsResponse>;
const searchEmails: SearchEmails = async (client, options, pageToken) => {
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
  client: Auth.OAuth2Client,
  emailId: string
): Promise<Record<string, unknown>> => {
  const gmail = google.gmail({ version: 'v1', auth: client });
  const { data } = await gmail.users.messages.get({
    userId: 'me',
    id: emailId,
  });

  return data;
};

export default {
  getClient,
  getToken,
  refreshAccessToken,
  getUserInfo,
  hasRequiredScopes,
  searchEmails,
  getEmail,
};
