import { reducer as accountReducer, sagas as accountSagas } from './account';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import {
  reducer as newslettersReducer,
  sagas as newslettersSagas,
} from './newsletters';

import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import { reducer as gmailReducer } from './gmail';

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

export { store };
