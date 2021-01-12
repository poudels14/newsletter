import React, { lazy, useMemo, useEffect } from 'react';
import { Redirect, Switch, matchPath, withRouter } from 'react-router-dom';
import { Actions as AccountActions } from './controllers/account';
import { Homepage } from './pages/homepage';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { SplashScreen } from './pages/splashscreen';
import { connect } from 'react-redux';
import { store } from './controllers/app';
import { Actions as DeviceActions } from './controllers/device';

import { Actions as NewsletterActions } from './controllers/newsletters';
import AppTabMenu from './pages/components/mobile/apptabmenu';
import useMedia from './utils/media';

const Highlights = lazy(() => import('./pages/components/highlights'));
const Settings = lazy(() => import('./pages/settings'));
const Integrations = lazy(() => import('./pages/integrations'));

const getDeviceType = () => {
  return useMedia(
    ['(max-width: 640px)', '(min-width: 600px) and (max-width: 1020px)'],
    [
      {
        mobile: true,
      },
      {
        tablet: true,
      },
    ],
    {
      desktop: true,
    }
  );
};

const appRoutes = (path) => {
  let homepage = matchPath(path, {
    path: ['/nl/:newsletterId/digests/:digestId', '/nl/:newsletterId?', '/'],
  });
  let settings = matchPath(path, {
    path: ['/settings'],
  });
  let integrations = matchPath(path, {
    path: ['/integrations'],
  });
  let highlights = matchPath(path, {
    path: ['/highlights'],
  });
  const activeTab = useMemo(() => {
    if (settings) {
      return 'settings';
    }
    if (highlights) {
      return 'highlights';
    }
    return 'homepage';
  }, [homepage, settings, highlights]);

  return {
    homepage,
    settings,
    highlights,
    integrations,
    activeTab,
  };
};

const NotFoundPage = () => <div>404 Not found</div>;

const PrivateApp = (props) => {
  const routes = appRoutes(props.location.pathname);
  const digestId = routes.homepage?.params?.digestId;

  useEffect(() => {
    // Note(sagar): newsletterId changes when viewing a digest from homepage
    //              so, only update publisher when user isn't viewing the digest
    //              and either the digest isn't loaded (first load) or the publisher
    //              tab changed
    const newPublisher = routes.homepage?.params?.newsletterId;
    if (
      !props.digestsLoaded ||
      (props.selectedPublisher !== newPublisher && !digestId)
    ) {
      props.setPublisher(newPublisher);
    }
  }, [routes.homepage?.params?.newsletterId, digestId]);

  return (
    <>
      <Switch>
        {routes.homepage?.isExact && (
          <Homepage
            publisher={routes.homepage?.params?.newsletterId}
            digestId={digestId}
            history={props.history}
          />
        )}
        {routes.settings && <Settings />}
        {routes.highlights && <Highlights />}
        {routes.integrations && <Integrations />}
        <NotFoundPage />
      </Switch>
      {props.deviceType?.mobile && <AppTabMenu active={routes.activeTab} />}
    </>
  );
};
PrivateApp.propTypes = {
  /** React router props */
  location: PropTypes.object,
  history: PropTypes.object,
  /** Redux */
  user: PropTypes.object,
  deviceType: PropTypes.object,
  digestsLoaded: PropTypes.bool,
  selectedPublisher: PropTypes.string,
  setDeviceType: PropTypes.func,
  setPublisher: PropTypes.func,
};
const mapStateToProps = (state) => {
  const { account, device, newsletters } = state;
  return {
    user: account?.user,
    deviceType: device?.type,
    digestsLoaded: newsletters?.digests?.length > 0,
    selectedPublisher: newsletters?.digestFilters?.newsletterId,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    setPublisher: (newsletterId) =>
      dispatch({
        type: NewsletterActions.UPDATE_DIGEST_FILTERS,
        filters: { newsletterId },
      }),
  };
};
const ConnectedPrivateApp = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(PrivateApp)
);

const AppContainer = (props) => {
  const deviceType = getDeviceType();
  useEffect(() => {
    props.setDeviceType(deviceType);
  }, [deviceType]);

  useEffect(() => {
    props.loadAccount();
  }, []);

  if (props.user != undefined && !props.user?.email) {
    window.location.href = '/signin';
    return <></>;
  }
  if (
    props.user != undefined &&
    !props.user?.hasRequiredAccess &&
    !props.user?.settings?.gmailLinkingSkipped
  ) {
    return <Redirect to="/integrations/gmail" />;
  }
  if (!props.user) {
    return <SplashScreen />;
  }
  return <ConnectedPrivateApp />;
};
AppContainer.propTypes = {
  /** Redux */
  user: PropTypes.object,
  setDeviceType: PropTypes.func,
  loadAccount: PropTypes.func,
};

const ConnectedAppContainer = connect(
  (state) => {
    const { account } = state;
    return {
      user: account?.user,
    };
  },
  (dispatch) => {
    return {
      loadAccount: () => dispatch({ type: AccountActions.LOAD }),
      setDeviceType: (device) =>
        dispatch({ type: DeviceActions.SET_DEVICE_TYPE, device }),
    };
  }
)(AppContainer);

const ReduxApp = () => {
  return (
    <Provider store={store}>
      <ConnectedAppContainer />
    </Provider>
  );
};
export default ReduxApp;
