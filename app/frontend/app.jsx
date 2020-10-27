import React, { lazy, useMemo, useEffect } from 'react';
import { Redirect, Switch, useRouteMatch } from 'react-router-dom';
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

const useAppRoutes = () => {
  let homepage = useRouteMatch({
    path: ['/nl/:newsletterId?', '/'],
  });
  let settings = useRouteMatch({
    path: ['/settings'],
  });
  let highlights = useRouteMatch({
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
    activeTab,
  };
};

const NotFoundPage = () => <div>404 Not found</div>;

const PrivateApp = (props) => {
  const routes = useAppRoutes();

  useEffect(() => {
    props.setPublisher(routes.homepage?.params?.newsletterId);
  }, [routes.homepage?.params?.newsletterId]);

  return (
    <>
      <Switch>
        {routes.homepage?.isExact && (
          <Homepage publisher={routes.homepage?.params?.newsletterId} />
        )}
        {routes.settings && <Settings />}
        {routes.highlights && <Highlights />}
        <NotFoundPage />
      </Switch>
      {props.deviceType?.mobile && <AppTabMenu active={routes.activeTab} />}
    </>
  );
};
PrivateApp.propTypes = {
  /** Redux */
  user: PropTypes.object,
  deviceType: PropTypes.object,
  setDeviceType: PropTypes.func,
  setPublisher: PropTypes.func,
};
const mapStateToProps = (state) => {
  const { account } = state;
  return {
    user: account?.user,
    deviceType: state?.device?.type,
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
const ConnectedPrivateApp = connect(
  mapStateToProps,
  mapDispatchToProps
)(PrivateApp);

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
    return <Redirect to="/grantaccess" />;
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
