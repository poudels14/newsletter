import {
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch,
} from 'react-router-dom';

import { Homepage } from './pages/homepage';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import React from 'react';
import { SplashScreen } from './pages/splashscreen';
import { connect } from 'react-redux';
import { store } from './controllers/app';

const PrivateApp = (props) => {
  if (props.user != undefined && !props.user?.email) {
    return <Redirect to="/signin" />;
  }
  if (
    props.user != undefined &&
    !props.user?.hasRequiredAccess &&
    !props.user?.settings?.gmailLinkingSkipped
  ) {
    return <Redirect to="/grantaccess" />;
  }
  if (!props.user) {
    return <SplashScreen />;
  }
  return (
    <Router>
      <Switch>
        <Route
          path={['/nl/:newsletterId?', '/']}
          exact
          render={(props) => {
            const { newsletterId: publisher } = props.match?.params;
            const query = new URLSearchParams(props.location.search);
            const digestId = query.get('digestId');
            return (
              <Homepage
                user={props.user}
                publisher={publisher}
                digestId={digestId}
                history={props.history}
              />
            );
          }}
        />
      </Switch>
    </Router>
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

const ReduxApp = () => {
  return (
    <Provider store={store}>
      <ConnectedPrivateApp />
    </Provider>
  );
};
export default ReduxApp;
