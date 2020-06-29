import { connect as reduxConnect } from 'react-redux';
import axios from 'axios';

const gmailConfig = JSON.parse(
  document.getElementById('gmail-config').innerText
);

const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
];
const SCOPES =
  'openid profile email https://www.googleapis.com/auth/gmail.readonly';

const loadAuth2 = () => {
  return new Promise((resolve, reject) => {
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

const initAuthentication = async () => {
  await loadAuth2();
  await initClient();

  const auth2 = gapi.auth2.getAuthInstance();
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
  const auth2 = gapi.auth2.getAuthInstance();
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
  const authResponse = gapi.auth2
    .getAuthInstance()
    .currentUser.get()
    .getAuthResponse(true);

  const { id_token: authenticationCode, scope } = authResponse;
  const { data } = await axios.post('/api/account/gmail/signin', {
    authenticationCode,
    scope,
  });
  return data.hasRequiredAccess;
};

const requestOfflineAccess = async () => {
  await gapi.auth2
    .getAuthInstance()
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

export { initAuthentication, signIn, hasRequiredAccess, requestOfflineAccess };

/** Redux */
const Actions = {
  INITIALIZE: '/gmail/initialzied',
  SET_USER: '/gmail/user/set',
};

const reducer = (prevState = {}, action) => {
  switch (action.type) {
    case Actions.INITIALIZE: {
      return {
        ...prevState,
        initialized: true,
      };
    }
    case Actions.SET_USER: {
      return {
        ...prevState,
        user: action.user,
      };
    }
    default:
      return prevState;
  }
};

const mapStateToProps = (state) => state.gmail || {};

const mapDispatchToProps = (dispatch) => {
  return {
    initialize: () => dispatch({ type: Actions.INITIALIZE }),
    setUser: (user) => {
      return dispatch({ type: Actions.SET_USER, user });
    },
  };
};

const connect = reduxConnect(mapStateToProps, mapDispatchToProps);
export { reducer, connect };
