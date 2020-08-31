import axios from 'axios';
/* global gapi */

const gmailConfig = JSON.parse(
  document.getElementById('gmail-config').innerText
);

const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
];
const SCOPES =
  'openid profile email https://www.googleapis.com/auth/gmail.readonly';

const loadAuth2 = () => {
  return new Promise((resolve) => {
    gapi.load('client:auth2', () => {
      resolve();
    });
  });
};

const initClient = async () => {
  await gapi.client.init({
    ...gmailConfig,
    discoveryDocs: DISCOVERY_DOCS,
    scope: 'profile',
  });
};

const initGmailApi = (function () {
  let initialized = false;

  return async () => {
    if (!initialized) {
      await loadAuth2();
      await initClient();
      initialized = true;
    }
  };
})();

const getAuthInstance = async () => {
  await initGmailApi();
  return gapi.auth2.getAuthInstance();
};

const initAuthentication = async () => {
  const auth2 = await getAuthInstance();
  const loggedIntoGoogle = auth2.isSignedIn.get();
  const user = auth2.currentUser.get();

  if (loggedIntoGoogle) {
    // Note(sagar): if the user is already logged in to Google,
    //     sign in to our server to make sure our cookies are set and valid
    return await setCookies(user);
  }
  return null;
};

const signIn = async () => {
  const auth2 = await getAuthInstance();
  const user = await auth2.signIn();
  return await setCookies(user);
};

const setCookies = async (user) => {
  const authResponse = user.getAuthResponse(true);
  const { id_token: authenticationCode, scope } = authResponse;
  const { data } = await axios.post('/api/account/gmail/signin', {
    authenticationCode,
    scope,
  });

  const { signedIn, hasRequiredAccess } = data;
  if (signedIn) {
    return {
      ...getUserProfile(user),
      hasRequiredAccess,
    };
  }
  return null;
};

const getUserProfile = (user) => {
  const profile = user.getBasicProfile();
  return {
    email: profile.getEmail(),
    firstName: profile.getGivenName(),
    lastName: profile.getFamilyName(),
    hasRequiredAccess: user.hasGrantedScopes(SCOPES),
  };
};

const hasRequiredAccess = async () => {
  const auth2 = await getAuthInstance();
  const authResponse = auth2.currentUser.get().getAuthResponse(true);

  const { id_token: authenticationCode, scope } = authResponse;
  const { data } = await axios.post('/api/account/gmail/signin', {
    authenticationCode,
    scope,
  });
  return data.hasRequiredAccess;
};

const requestOfflineAccess = async () => {
  const auth2 = await getAuthInstance();
  await auth2
    .grantOfflineAccess({
      client_id: gmailConfig.clientId,
      access_type: 'offline',
      scope: SCOPES,
    })
    .then((res) => axios.post('/api/account/gmail/authorize', res));

  // Note(sagar): reinit client so that google info is reloaded
  // TODO(sagar): this might not be needed, investigate later
  await initClient();
  return getUserProfile(gapi.auth2.getAuthInstance().currentUser.get());
};

export {
  initGmailApi,
  initAuthentication,
  signIn,
  hasRequiredAccess,
  requestOfflineAccess,
};
