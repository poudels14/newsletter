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

const initAuthentication = async () => {
  await loadAuth2();
  await gapi.client.init({
    ...gmailConfig,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES,
  });

  const auth2 = gapi.auth2.getAuthInstance();
  const isSignedIn = auth2.isSignedIn.get();
  if (isSignedIn) {
    const user = auth2.currentUser.get();
    if (!user.hasGrantedScopes(SCOPES)) {
      await user.grant({ scope: SCOPES });
    }

    await setCookies(user);

    return getUserProfile(user);
  }
  return null;
};

const signIn = async () => {
  const auth2 = gapi.auth2.getAuthInstance();
  const user = await auth2.signIn();
  await setCookies(user);
  return getUserProfile(user);
};

const setCookies = async (user) => {
  const authResponse = user.getAuthResponse(true);

  const { id_token: authenticationCode, scope } = authResponse;
  const { data } = await axios.post('/api/account/gmail/signin', {
    authenticationCode,
    scope,
  });

  if (!data.success) {
    return await requestOfflineAccess(user);
  }
  return true;
};

const getUserProfile = (user) => {
  const profile = user.getBasicProfile();
  return {
    email: profile.getEmail(),
    firstName: profile.getGivenName(),
    lastName: profile.getFamilyName(),
  };
};

const requestOfflineAccess = async (user) => {
  const { success } = await user
    .grantOfflineAccess({
      client_id: gmailConfig.clientId,
      access_type: 'offline',
      scope: SCOPES,
    })
    .then((res) => axios.post('/api/account/gmail/authorize', res));

  return success;
};

export { initAuthentication, signIn };

/** Redux */
const Actions = {
  INITIALIZED: '/gmail/initialzied',
  SET_USER: '/gmail/user/set',
};

const reducer = (prevState = {}, action) => {
  switch (action.type) {
    case Actions.INITIALIZED: {
      return {
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
    setInitialized: () => dispatch({ type: Actions.INITIALIZED }),
    setUser: (user) => {
      return dispatch({ type: Actions.SET_USER, user });
    },
  };
};

const connect = reduxConnect(mapStateToProps, mapDispatchToProps);
export { reducer, connect };
