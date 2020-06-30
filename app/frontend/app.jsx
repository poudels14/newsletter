import React, { useMemo } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import 'semantic-ui-css/semantic.min.css';

import { SplashScreen } from './splashscreen';

import {
  reducer as gmailReducer,
  initAuthentication,
  connect as connectGmail,
} from './authenticate/gmail';

import { Homepage } from './pages/homepage';
import { Signin } from './pages/signin';
import { RequestGmailAccess } from './pages/requestgmailaccess';

const init = (props) => {
  initAuthentication().then(async (user) => {
    if (user) {
      props.setUser(user);
      props.initialize();
    } else {
      props.initialize();
    }
  });
};

const App = (props) => {
  useMemo(() => {
    init(props);
  }, []);

  const splash = !props.initialized;
  const loggedIn = props.user?.email;
  const hasRequiredAccess = props.user?.hasRequiredAccess;

  if (splash) {
    return <SplashScreen />;
  } else {
    return (
      <Router>
        <Switch>
          <Route
            path="/"
            exact
            render={(p) => {
              if (!loggedIn) {
                return <Redirect to="/signin" />;
              }
              if (!hasRequiredAccess) {
                return <Redirect to="/grantaccess" />;
              }
              return <Homepage history={p.history} />;
            }}
          />
          <Route
            path="/signin"
            render={() => {
              return loggedIn ? (
                <Redirect to="/" />
              ) : (
                <Signin setUser={props.setUser} />
              );
            }}
          />
          <Route
            path="/grantaccess"
            render={() => {
              return hasRequiredAccess ? (
                <Redirect to="/" />
              ) : (
                <RequestGmailAccess setUser={props.setUser} />
              );
            }}
          />
        </Switch>
      </Router>
    );
  }
};
const ConnectedApp = connectGmail(App);

const ReduxApp = () => {
  const store = buildStore();
  return (
    <Provider store={store}>
      <ConnectedApp />
    </Provider>
  );
};
export { ReduxApp as App };

/** Redux */

const composeEnhancers = composeWithDevTools({ trace: true });
const buildStore = () => {
  return createStore(
    combineReducers({
      gmail: gmailReducer,
    }),
    composeEnhancers()
  );
};
