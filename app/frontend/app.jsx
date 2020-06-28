import { useMemo } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import 'semantic-ui-css/semantic.min.css';

import {
  reducer as gmailReducer,
  initAuthentication,
  connect as connectGmail,
} from './authenticate/gmail';

import { SplashScreen } from './splashscreen';
import { Homepage } from './pages/homepage';
import { Signin } from './pages/signin';

const init = (props) => {
  initAuthentication().then((user) => {
    props.setInitialized();
    props.setUser(user);
  });
};

const PrivatePages = () => {
  return (
    <Router>
      <Switch>
        <Route
          path="/"
          exact
          render={() => {
            return <Homepage />;
          }}
        />
      </Switch>
    </Router>
  );
};

const App = (props) => {
  useMemo(() => {
    init(props);
  }, []);

  const splash = !props?.initialized;
  const loggedIn = !!props?.user?.email;

  return (
    <>
      {splash && <SplashScreen />}
      {loggedIn && <PrivatePages />}
      {!splash && !loggedIn && <Signin />}
    </>
  );
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
