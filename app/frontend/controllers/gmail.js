import { connect as reduxConnect } from 'react-redux';

/** Redux */
const Actions = {
  INITIALIZE: '/gmail/initialzied',
  SET_USER: '/gmail/user/set',
};

const reducer = (prevState = {}, action) => {
  switch (action.type) {
    case Actions.INITIALIZE: {
      return {
        ...prevState,
        initialized: true,
      };
    }
    case Actions.SET_USER: {
      return {
        ...prevState,
        user: action.user,
      };
    }
    default:
      return prevState;
  }
};

const mapStateToProps = (state) => state.gmail || {};

const mapDispatchToProps = (dispatch) => {
  return {
    initialize: () => dispatch({ type: Actions.INITIALIZE }),
    setUser: (user) => {
      return dispatch({ type: Actions.SET_USER, user });
    },
  };
};

const connect = reduxConnect(mapStateToProps, mapDispatchToProps);
export { reducer, connect };
