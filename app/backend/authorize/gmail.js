import { google } from 'googleapis';
import lo from 'lodash';
import dotenv from 'dotenv';
dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URL
);

const REQUIRED_SCOPES =
  'openid profile email https://www.googleapis.com/auth/gmail.readonly';

const getToken = async (code) => {
  return await oAuth2Client.getToken(code).then((res) => res.tokens);
};

const refreshAccessToken = async (refreshToken) => {
  oAuth2Client.setCredentials({
    refresh_token: refreshToken,
    include_granted_scopes: true,
  });
  return await oAuth2Client.getAccessToken();
};

const hasRequiredScopes = (scopes) => {
  return lo.difference(REQUIRED_SCOPES, scopes).length === 0;
};

// Get user info from the JWT id_token received from `oAuth2Client.getToken`
const getUserInfo = async (idToken) => {
  const data = await oAuth2Client.verifyIdToken({
    idToken: idToken,
    audience: process.env.GMAIL_CLIENT_ID,
  });
  return data?.payload;
};

const getEmails = (token) => {
  oAuth2Client.setCredentials(token);

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  gmail.users.messages.list(
    {
      userId: 'me',
      q: 'from: goodbetterbest@substack.com',
    },
    (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      console.log(res.data);

      const { messages } = res.data;

      console.log('labels = ', res.data.labels);

      gmail.users.messages
        .get({
          userId: 'me',
          id: messages[0].id,
        })
        .then(function (response2) {
          console.log(JSON.stringify(response2.data));
        });
      // const labels = res.data.labels;
      // if (labels.length) {
      //   console.log('Labels:');
      //   labels.forEach((label) => {
      //     console.log(`- ${label.name}`);
      //   });
      // } else {
      //   console.log('No labels found.');
      // }
    }
  );
};

export {
  getToken,
  refreshAccessToken,
  getUserInfo,
  getEmails,
  hasRequiredScopes,
};
