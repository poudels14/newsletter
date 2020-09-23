import { all, delay, put, select, takeEvery } from 'redux-saga/effects';

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

  SET_INITIAL_DIGEST_FILTERS: '/newsletters/digests/filters/set', // triggered after stored filters are loaded from server
  UPDATE_DIGEST_FILTERS: '/newsletters/digests/filters/update',
  APPEND_DIGESTS: '/newsletters/digests/append',
  LOAD_MORE_DIGESTS: '/newsletters/digests/loadmore',

  LOAD_HIGHLIGHTS: '/newsletters/highlights/load',
  APPEND_HIGHLIGHTS: '/newsletters/highlights/append',
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
    case Actions.SET_INITIAL_DIGEST_FILTERS: {
      const { filters } = action;
      return {
        ...state,
        digestFilters: filters,
      };
    }
    case Actions.UPDATE_DIGEST_FILTERS: {
      const { filters } = action;
      return {
        ...state,
        digestFilters: state.digestFilters
          ? { ...state.digestFilters, ...filters }
          : filters,
        digests: null,
        highlights: null, // reset highlights when different publisher is selected
      };
    }
    case Actions.APPEND_DIGESTS: {
      const { digests } = action;
      return {
        ...state,
        digests: state.digests ? state.digests.concat(digests) : digests,
      };
    }
    case Actions.APPEND_HIGHLIGHTS: {
      const highlights = state.highlights
        ? state.highlights.concat(action.highlights)
        : action.highlights;
      return {
        ...state,
        highlights: highlights,
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

function* updateDigestFiltersListener() {
  yield takeEvery(Actions.UPDATE_DIGEST_FILTERS, function* ({
    filters: newFilters,
  }) {
    const digestFilters = yield select(
      (state) => state.newsletters?.digestFilters
    );
    const digests = yield listDigests({
      params: { filters: digestFilters },
    });
    yield put({ type: Actions.APPEND_DIGESTS, digests });

    yield put({
      type: Actions.LOAD_HIGHLIGHTS,
      filters: digestFilters,
    });

    // NOTE(sagar): update settings if filter other than newsletterId is changed
    const persistantFiltersUpdated = Object.keys(newFilters).find(
      (f) => f !== 'newsletterId'
    );
    if (persistantFiltersUpdated) {
      yield axios.post('/api/account/updateSettings', {
        settings: { digestFilters },
      });
    }
  });
}

function* loadMoreDigestsListener() {
  yield takeEvery(Actions.LOAD_MORE_DIGESTS, function* ({ offset }) {
    const digestFilters = yield select(
      (state) => state.newsletters?.digestFilters
    );
    const digests = yield listDigests({
      params: { filters: digestFilters, offset },
    });
    yield put({ type: Actions.APPEND_DIGESTS, digests });
  });
}

function* loadHighlightsListener() {
  yield takeEvery(Actions.LOAD_HIGHLIGHTS, function* ({ filters }) {
    const { data } = yield axios.get('/api/newsletters/listHighlights', {
      params: { filters },
    });
    yield put({ type: Actions.APPEND_HIGHLIGHTS, highlights: data });
  });
}

function* sagas() {
  yield all([
    populateListener(),
    loadPublishersListener(),
    updateDigestFiltersListener(),
    loadMoreDigestsListener(),
    loadHighlightsListener(),
  ]);
}

export { Actions, reducer, sagas };
