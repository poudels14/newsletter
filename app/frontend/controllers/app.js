import { reducer as accountReducer, sagas as accountSagas, Actions as AccountActions } from './account';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';

Sentry.init({
  /* eslint-disable-next-line no-undef */
  environment: process.env.NODE_ENV || "development",
  /* eslint-disable-next-line no-undef */
  release: "alpine@" + process.env.COMMIT_HASH || "localhost",
  dsn: "https://119ea93ebd0d4b648a108a91d97ddc21@o476561.ingest.sentry.io/5516488",
  integrations: [
    new Integrations.BrowserTracing(),
  ],

  // TODO(sagar): reduce sample rate
  tracesSampleRate: 1.0,
  normalizeDepth: 10,
});

const sentryReduxEnhancer = Sentry.createReduxEnhancer({
  actionTransformer: action => {
    // Note(sagar): this data is sent to Sentry, so only log action type
    if (action.type === AccountActions.SET_USER) {
      Sentry.configureScope(function(scope) {
        scope.setUser({
          id: action.user?.id,
        });
      });
    }
    return {
      type: action.type,
    };
  },
  stateTransformer: state => {
    return {
      device: state.device,
      // TODO(sagar): maybe not log entire account data
      account: state.account,
    }
  },
});

import {
  reducer as newslettersReducer,
  sagas as newslettersSagas,
} from './newsletters';

import { reducer as gmailReducer } from './gmail';
import { reducer as deviceReducer } from './device';

/** store */
const composeEnhancers = composeWithDevTools({ trace: true });
const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  combineReducers({
    device: deviceReducer,
    account: accountReducer,
    gmail: gmailReducer,
    newsletters: newslettersReducer,
  }),
  composeEnhancers(applyMiddleware(sagaMiddleware), sentryReduxEnhancer)
);
sagaMiddleware.run(newslettersSagas);
sagaMiddleware.run(accountSagas);

export { store };
