import { all, put, takeEvery } from 'redux-saga/effects';

import axios from 'axios';

const listDigest = async () => {
  const { data } = await axios.get('/api/newsletters/listDigests');
  return data;
};

/** Redux */

const Actions = {
  LOAD_PUBLISHERS: '/newsletters/publishers/load',
  SET_PUBLISHERS: '/newsletters/publishers/set',
  SELECT_PUBLISHER: '/newsletters/publishers/select',
  SET_DIGESTS: '/newsletters/digests/set',
};

const reducer = (state = {}, action) => {
  switch (action.type) {
    case Actions.LOAD: {
      return {
        ...state,
        filters: action.filters,
      };
    }
    case Actions.SELECT_PUBLISHER: {
      return {
        ...state,
        selectedPublisher: action.publisher,
      };
    }
    case Actions.SET_PUBLISHERS: {
      const { publishers } = action;
      return {
        ...state,
        publishers,
      };
    }
    case Actions.SET_DIGESTS: {
      const { digests } = action;
      return {
        ...state,
        digests,
      };
    }
    default:
      return state;
  }
};

function* loadPublishersListener() {
  yield takeEvery(Actions.LOAD_PUBLISHERS, function* () {
    const { data } = yield axios.get('/api/newsletters/listNewsletters');
    yield put({ type: Actions.SET_PUBLISHERS, publishers: data });
  });
}

function* selectPublisherListener() {
  yield takeEvery(Actions.SELECT_PUBLISHER, function* ({ publisher }) {
    const { data } = yield axios.get('/api/newsletters/listDigests', {
      params: { filters: { newsletterId: publisher } },
    });
    yield put({ type: Actions.SET_DIGESTS, digests: data });
  });
}

function* sagas() {
  yield all([loadPublishersListener(), selectPublisherListener()]);
}

export { listDigest, Actions, reducer, sagas };
