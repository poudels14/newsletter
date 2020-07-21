import 'semantic-ui-css/semantic.min.css';
import 'antd/dist/antd.css';

import React, { useMemo } from 'react';
import {
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch,
} from 'react-router-dom';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import {
  connect as connectGmail,
  reducer as gmailReducer,
} from './controllers/gmail';
import {
  reducer as newslettersReducer,
  sagas as newslettersSagas,
} from './controllers/newsletters';

import { Homepage } from './pages/homepage';
import { Provider } from 'react-redux';
import { RequestGmailAccess } from './pages/requestgmailaccess';
import { Signin } from './pages/signin';
import { SplashScreen } from './splashscreen';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import { initAuthentication } from './authenticate/gmail';

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

const NoMatch = () => {
  return <div>404 Not found</div>;
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
          <Route
            path={['/nl/:newsletterId?', '/']}
            exact
            render={(props) => {
              const { newsletterId } = props.match?.params;
              const query = new URLSearchParams(props.location.search);

              if (!loggedIn) {
                return <Redirect to="/signin" />;
              }
              if (!hasRequiredAccess) {
                return <Redirect to="/grantaccess" />;
              }
              return (
                <Homepage
                  history={props.history}
                  publisher={newsletterId}
                  digestId={query.get('digestId')}
                />
              );
            }}
          />
          <Route path="*">
            <NoMatch />
          </Route>
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
const sagaMiddleware = createSagaMiddleware();
const buildStore = () => {
  const store = createStore(
    combineReducers({
      gmail: gmailReducer,
      newsletters: newslettersReducer,
    }),
    composeEnhancers(applyMiddleware(sagaMiddleware))
  );
  sagaMiddleware.run(newslettersSagas);
  return store;
};
