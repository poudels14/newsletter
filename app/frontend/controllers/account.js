import { all, put, takeEvery } from 'redux-saga/effects';

import { Actions as NewsletterActions } from './newsletters';
import axios from 'axios';

const Actions = {
  LOAD: '/account/load',
  SET_USER: '/account/user/set',
};

const reducer = (prevState = {}, action) => {
  switch (action.type) {
    case Actions.SET_USER: {
      const { user } = action;
      return {
        ...prevState,
        user,
      };
    }
    default:
      return prevState;
  }
};

function* loadListener() {
  yield takeEvery(Actions.LOAD, function* () {
    const { data: user } = yield axios.get('/api/account/profile');

    // Note(sagar): since user.settings contains digestFilters, update the newsletters filter after profile is loaded
    yield put({
      type: NewsletterActions.SET_DIGEST_FILTERS,
      filters: user?.settings?.digestFilters,
    });

    yield put({ type: Actions.SET_USER, user });
  });
}

function* sagas() {
  yield all([loadListener()]);
}

export { Actions, reducer, sagas };
