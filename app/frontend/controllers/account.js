import { all, put, takeEvery } from 'redux-saga/effects';

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
    yield put({ type: Actions.SET_USER, user });
  });
}

function* sagas() {
  yield all([loadListener()]);
}

export { Actions, reducer, sagas };
