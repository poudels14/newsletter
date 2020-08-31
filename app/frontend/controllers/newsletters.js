import { all, delay, put, takeEvery } from 'redux-saga/effects';

import axios from 'axios';

const listDigests = async (options) => {
  const { data } = await axios.get('/api/newsletters/listDigests', options);
  return data;
};

const Actions = {
  POPULATE: '/newsletters/populate',
  POLL_POPULATE_STATUS: '/newsletters/populate/status/poll',
  SET_POPULATE_STATUS: '/newsletters/populate/status/set',

  LOAD_PUBLISHERS: '/newsletters/publishers/load',
  SET_PUBLISHERS: '/newsletters/publishers/set',
  SELECT_PUBLISHER: '/newsletters/publishers/select',

  APPEND_DIGESTS: '/newsletters/digests/append',
  LOAD_MORE_DIGESTS: '/newsletters/digests/loadmore',
};

const reducer = (state = {}, action) => {
  switch (action.type) {
    case Actions.SET_POPULATE_STATUS: {
      const { status } = action;
      return {
        ...state,
        populateStatus: status,
      };
    }
    case Actions.SET_PUBLISHERS: {
      const { publishers } = action;
      return {
        ...state,
        publishers,
      };
    }
    case Actions.SELECT_PUBLISHER: {
      return {
        ...state,
        selectedPublisher: action.publisher,
        digests: [],
      };
    }
    case Actions.APPEND_DIGESTS: {
      const { digests } = action;
      return {
        ...state,
        digests: state.digests.concat(digests),
      };
    }
    default:
      return state;
  }
};

function* populateListener() {
  yield takeEvery(Actions.POPULATE, function* () {
    const { data } = yield axios.get('/api/newsletters/populate');
    yield put({ type: Actions.SET_POPULATE_STATUS, status: data });

    while (true) {
      const { data } = yield axios.get('/api/newsletters/populate/status');
      if (data.inProgress === 0) {
        yield put({ type: Actions.SET_POPULATE_STATUS, status: data });

        // update newsletters after populating is completed
        yield put({ type: Actions.LOAD_PUBLISHERS });
        // TODO(sagar): maybe update the digest list as well?
        break;
      }
      yield delay(2000);
    }
  });
}

function* loadPublishersListener() {
  yield takeEvery(Actions.LOAD_PUBLISHERS, function* () {
    const { data } = yield axios.get('/api/newsletters/listNewsletters');
    yield put({ type: Actions.SET_PUBLISHERS, publishers: data });
  });
}

function* selectPublisherListener() {
  yield takeEvery(Actions.SELECT_PUBLISHER, function* ({ publisher }) {
    const digests = yield listDigests({
      params: { filters: { newsletterId: publisher } },
    });
    yield put({ type: Actions.APPEND_DIGESTS, digests });
  });
}

function* loadMoreDigestsListener() {
  yield takeEvery(Actions.LOAD_MORE_DIGESTS, function* ({ publisher, offset }) {
    const digests = yield listDigests({
      params: { filters: { newsletterId: publisher }, offset },
    });
    yield put({ type: Actions.APPEND_DIGESTS, digests });
  });
}

function* sagas() {
  yield all([
    populateListener(),
    loadPublishersListener(),
    selectPublisherListener(),
    loadMoreDigestsListener(),
  ]);
}

export { Actions, reducer, sagas };
