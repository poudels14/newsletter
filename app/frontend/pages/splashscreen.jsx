import React, { useEffect } from 'react';

import { Actions as AccountActions } from '../controllers/account';
import { connect } from 'react-redux';

const SplashScreen = (props) => {
  useEffect(() => {
    props.loadAccount();
  }, []);

  return (
    <>
      <div>Loading app</div>
    </>
  );
};

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadAccount: () => dispatch({ type: AccountActions.LOAD }),
  };
};

const ConnectedSplashScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(SplashScreen);
export { ConnectedSplashScreen as SplashScreen };
