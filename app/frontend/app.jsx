import React, { lazy, useMemo, useEffect } from 'react';
import {
  Redirect,
  Switch,
  useRouteMatch,
  useLocation,
  useHistory,
} from 'react-router-dom';

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

const NotFoundPage = () => <div>404 Not found</div>;

const PrivateApp = (props) => {
  const deviceType = getDeviceType();

  let location = useLocation();
  let history = useHistory();
  let homepageRoute = useRouteMatch({
    path: ['/nl/:newsletterId?', '/'],
  });
  let settingsRoute = useRouteMatch({
    path: ['/settings'],
  });
  let highlightsRoute = useRouteMatch({
    path: ['/highlights'],
  });
  const activeTab = useMemo(() => {
    if (settingsRoute) {
      return 'settings';
    }
    if (highlightsRoute) {
      return 'highlights';
    }
    return 'homepage';
  }, [homepageRoute, settingsRoute, highlightsRoute]);

  useEffect(() => {
    props.setDeviceType(deviceType);
  }, [deviceType]);
  useEffect(() => {
    props.selectPublisher(homepageRoute?.params?.newsletterId);
  }, [homepageRoute]);

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

  return (
    <>
      <Switch>
        {homepageRoute?.isExact && (
          <Homepage
            publisher={homepageRoute?.params?.newsletterId}
            route={homepageRoute}
            location={location}
            user={props.user}
            history={history}
          />
        )}
        {settingsRoute && <Settings />}
        {highlightsRoute && <Highlights />}
        <NotFoundPage />
      </Switch>
      {props.deviceType.mobile && <AppTabMenu active={activeTab} />}
    </>
  );
};
PrivateApp.propTypes = {
  history: PropTypes.object,
  match: PropTypes.object,
  location: PropTypes.object,
  /** Redux */
  user: PropTypes.object,
  deviceType: PropTypes.object,
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
    setDeviceType: (device) =>
      dispatch({ type: DeviceActions.SET_DEVICE_TYPE, device }),
    selectPublisher: (newsletterId) =>
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

const ReduxApp = () => {
  return (
    <Provider store={store}>
      <ConnectedPrivateApp />
    </Provider>
  );
};
export default ReduxApp;
