import React, { Suspense, lazy } from 'react';
import {
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch,
} from 'react-router-dom';
import { connect as appConnect, store } from './controllers/app';

import { Homepage } from './pages/homepage';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { RequestGmailAccess } from './pages/requestgmailaccess';
import { Signin } from './pages/signin';
import { SplashScreen } from './pages/splashscreen';
import { connect } from 'react-redux';

const AdminHomepage = lazy(() => import('./pages/admin/homepage'));

const NoMatch = () => {
  return <div>404 Not found</div>;
};

const PrivateApp = (props) => {
  const { newsletterId: publisher } = props.match?.params;
  const query = new URLSearchParams(props.location.search);
  const digestId = query.get('digestId');

  if (props.user != undefined && !props.user?.email) {
    return <Redirect to="/signin" />;
  }
  if (props.user != undefined && !props.user?.hasRequiredAccess) {
    return <Redirect to="/grantaccess" />;
  }
  if (!props.user) {
    return <SplashScreen />;
  }
  return (
    <Homepage
      user={props.user}
      publisher={publisher}
      digestId={digestId}
      history={props.history}
    />
  );
};
PrivateApp.propTypes = {
  user: PropTypes.object,
  history: PropTypes.object,
  match: PropTypes.object,
  location: PropTypes.object,
};
const mapStateToProps = (state) => {
  const { account } = state;
  return {
    user: account?.user,
  };
};
const ConnectedPrivateApp = connect(mapStateToProps)(PrivateApp);

const App = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
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
              return <ConnectedPrivateApp {...props} />;
            }}
          />
          <Route
            path="/admin"
            render={() => {
              return <AdminHomepage />;
            }}
          />
          <Route path="*">
            <NoMatch />
          </Route>
        </Switch>
      </Router>
    </Suspense>
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
