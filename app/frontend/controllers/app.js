import {
  Actions as AccountActions,
  reducer as accountReducer,
  sagas as accountSagas,
} from './account';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import {
  reducer as newslettersReducer,
  sagas as newslettersSagas,
} from './newsletters';

import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import { reducer as gmailReducer } from './gmail';
import { connect as reduxConnect } from 'react-redux';

const mapStateToProps = (state) => {
  const { account } = state;
  const { user } = account;
  return {
    user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadAccount: () => dispatch({ type: AccountActions.LOAD }),
  };
};

const connect = reduxConnect(mapStateToProps, mapDispatchToProps);

/** store */
const composeEnhancers = composeWithDevTools({ trace: true });
const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  combineReducers({
    account: accountReducer,
    gmail: gmailReducer,
    newsletters: newslettersReducer,
  }),
  composeEnhancers(applyMiddleware(sagaMiddleware))
);
sagaMiddleware.run(newslettersSagas);
sagaMiddleware.run(accountSagas);

export { connect, store };
