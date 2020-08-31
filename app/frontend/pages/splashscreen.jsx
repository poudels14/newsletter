import React, { useEffect } from 'react';

import { Actions as AccountActions } from '../controllers/account';
import PropTypes from 'prop-types';
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
SplashScreen.propTypes = {
  loadAccount: PropTypes.func,
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
