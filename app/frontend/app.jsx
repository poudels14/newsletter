import {
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch,
} from 'react-router-dom';
import { connect as appConnect, store } from './controllers/app';

import { Homepage } from './pages/homepage';
import { Provider } from 'react-redux';
import React from 'react';
import { RequestGmailAccess } from './pages/requestgmailaccess';
import { Signin } from './pages/signin';
import { SplashScreen } from './pages/splashscreen';
import { connect } from 'react-redux';

const NoMatch = () => {
  return <div>404 Not found</div>;
};

const PrivateApp = (props) => {
  if (props.user != undefined && !props.user?.email) {
    return <Redirect to="/signin" />;
  }
  if (props.user != undefined && !props.user?.hasRequiredAccess) {
    return <Redirect to="/grantaccess" />;
  }
  if (!props.user) {
    return <SplashScreen />;
  }
  return <Homepage {...props} />;
};
const mapStateToProps = (state) => {
  const { account } = state;
  return {
    user: account?.user,
  };
};
const ConnectedPrivateApp = connect(mapStateToProps)(PrivateApp);

const App = (props) => {
  return (
    <Router>
      <Switch>
        <Route
          path="/signin"
          render={() => {
            return <Signin />;
          }}
        />
        <Route
          path="/grantaccess"
          render={() => {
            return <RequestGmailAccess />;
          }}
        />
        <Route
          path={['/nl/:newsletterId?', '/']}
          exact
          render={(props) => {
            const { newsletterId } = props.match?.params;
            const query = new URLSearchParams(props.location.search);
            return (
              <ConnectedPrivateApp
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
};

const ConnectedApp = appConnect(App);

const ReduxApp = () => {
  return (
    <Provider store={store}>
      <ConnectedApp />
    </Provider>
  );
};
export { ReduxApp as App };
