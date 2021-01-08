import { all, delay, put, select, takeEvery } from 'redux-saga/effects';

import axios from 'axios';

const listDigests = async (options) => {
  const { data } = await axios.get('/api/newsletters/listDigests', options);
  return data;
};

const sortHighlightsInDescByDate = (a, b) => {
  if (a.date > b.date) {
    return -1;
  }
  if (a.date < b.date) {
    return 1;
  }
  return 0;
};

const Actions = {
  POPULATE: '/newsletters/populate',
  POLL_POPULATE_STATUS: '/newsletters/populate/status/poll',
  UPDATE_POPULATE_STATUS: '/newsletters/populate/status/update',

  LOAD_PUBLISHERS: '/newsletters/publishers/load',
  LOAD_PUBLISHERS_SUCCEEDED: '/newsletters/publishers/load/succeeded',
  LOAD_PUBLISHERS_FAILED: '/newsletters/publishers/load/failed',

  SET_INITIAL_DIGEST_FILTERS: '/newsletters/filters/init', // triggered after stored filters are loaded from server
  UPDATE_DIGEST_FILTERS: '/newsletters/filters/update',

  LOAD_DIGESTS: '/newsletters/digests/load',
  LOAD_DIGESTS_SUCCEEDED: '/newsletters/digests/load/succeeded',
  LOAD_DIGESTS_FAILED: '/newsletters/digests/load/failed',
  LOAD_MORE_DIGESTS: '/newsletters/digests/load/more',

  LOAD_HIGHLIGHTS: '/newsletters/highlights/load',
  LOAD_HIGHLIGHTS_SUCCEEDED: '/newsletters/highlights/load/succeeded',
  ADD_HIGHLIGHT: '/newsletters/highlights/add',
  REMOVE_HIGHLIGHT: '/newsletters/highlights/remove',

  // toggle publisher on sidebar
  SET_HIDDEN_PUBLISHERS: '/newsletters/sidebar/setHiddenPublishers',
  HIDE_FROM_SIDEBAR: '/newsletters/sidebar/publisher/hide',
  SHOW_IN_SIDEBAR: '/newsletters/sidebar/publisher/show',

  ATTACH_SELECTION_CHANGE_LISTENER:
    '/newsletters/viewdigest/attach/selectionchange',
};

const reducer = (state = {}, action) => {
  switch (action.type) {
    case Actions.UPDATE_POPULATE_STATUS: {
      const { status } = action;
      return {
        ...state,
        populateStatus: status,
      };
    }
    case Actions.LOAD_PUBLISHERS_SUCCEEDED: {
      const { publishers } = action;
      const publishersById = publishers.reduce((agg, publisher) => {
        agg[publisher.id] = publisher;
        return agg;
      }, {});
      return {
        ...state,
        publishers,
        publishersById,
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
    case Actions.LOAD_DIGESTS_SUCCEEDED: {
      const { digests } = action;
      return {
        ...state,
        digests: state.digests ? state.digests.concat(digests) : digests,
      };
    }
    case Actions.LOAD_HIGHLIGHTS_SUCCEEDED: {
      const newHighlights = action.highlights.map((h) => {
        h.date = new Date(h.date);
        return h;
      });
      const highlights = (state.highlights || [])
        .concat(newHighlights)
        .sort(sortHighlightsInDescByDate);
      return {
        ...state,
        highlights,
      };
    }
    case Actions.REMOVE_HIGHLIGHT: {
      const highlights = state.highlights?.filter(
        (h) => h.id !== action.highlight.id
      );
      return {
        ...state,
        highlights,
      };
    }
    case Actions.SET_HIDDEN_PUBLISHERS:
      return {
        ...state,
        hiddenPublishers: action.hiddenPublishers,
      };
    case Actions.HIDE_FROM_SIDEBAR: {
      const hiddenPublishers = (state.hiddenPublishers || []).concat([
        action.publisherId,
      ]);
      return {
        ...state,
        hiddenPublishers,
      };
    }
    case Actions.SHOW_IN_SIDEBAR: {
      const hiddenPublishers = (state.hiddenPublishers || []).filter(
        (pId) => pId !== action.publisherId
      );
      return {
        ...state,
        hiddenPublishers,
      };
    }
    default:
      return state;
  }
};

function* populateListener() {
  yield takeEvery(Actions.POPULATE, function* () {
    const { data: status } = yield axios.get('/api/newsletters/populate');
    yield put({ type: Actions.UPDATE_POPULATE_STATUS, status });

    if (status.inProgress) {
      while (true) {
        const { data } = yield axios.get('/api/newsletters/populate/status');
        if (data.inProgress === 0) {
          yield put({ type: Actions.UPDATE_POPULATE_STATUS, status: data });

          // update newsletters after populating is completed
          yield put({ type: Actions.LOAD_PUBLISHERS });
          // NOTE(sagar): trigger update digest filter with empty filters to refresh digest list
          yield put({ type: Actions.UPDATE_DIGEST_FILTERS, filters: {} });
          break;
        }
        yield delay(2000);
      }
    }
  });
}

function* loadPublishersListener() {
  yield takeEvery(Actions.LOAD_PUBLISHERS, function* () {
    const { data } = yield axios.get('/api/newsletters/listNewsletters');
    yield put({ type: Actions.LOAD_PUBLISHERS_SUCCEEDED, publishers: data });
  });
}

function* updateDigestFiltersListener() {
  yield takeEvery(Actions.UPDATE_DIGEST_FILTERS, function* ({
    filters: newFilters,
  }) {
    yield put({ type: Actions.LOAD_DIGESTS });
    // NOTE(sagar): update settings if filter other than newsletterId is changed
    const persistantFiltersUpdated = Object.keys(newFilters).find(
      (f) => f !== 'newsletterId'
    );
    if (persistantFiltersUpdated) {
      const digestFilters = yield select(
        (state) => state.newsletters?.digestFilters
      );
      const { unreadOnly } = digestFilters;
      yield axios.post('/api/account/updateSettings', {
        settings: { digestFilters: { unreadOnly } },
      });
    }
  });
}

function* loadDigestsListener() {
  yield takeEvery(Actions.LOAD_DIGESTS, function* () {
    const digestFilters = yield select(
      (state) => state.newsletters?.digestFilters
    );
    const digests = yield listDigests({
      params: { filters: digestFilters },
    });
    yield put({ type: Actions.LOAD_DIGESTS_SUCCEEDED, digests });

    yield put({
      type: Actions.LOAD_HIGHLIGHTS,
      filters: digestFilters,
    });
  });
}

function* loadMoreDigestsListener() {
  // TODO(sagar): use takeLatest here
  yield takeEvery(Actions.LOAD_MORE_DIGESTS, function* ({ offset }) {
    const digestFilters = yield select(
      (state) => state.newsletters?.digestFilters
    );
    const digests = yield listDigests({
      params: { filters: digestFilters, offset },
    });
    yield put({ type: Actions.LOAD_DIGESTS_SUCCEEDED, digests });
  });
}

function* loadHighlightsListener() {
  yield takeEvery(Actions.LOAD_HIGHLIGHTS, function* ({ filters }) {
    const { data } = yield axios.get('/api/newsletters/listHighlights', {
      params: { filters },
    });
    yield put({ type: Actions.LOAD_HIGHLIGHTS_SUCCEEDED, highlights: data });
  });
}

function* addHighlightListener() {
  yield takeEvery(Actions.ADD_HIGHLIGHT, function* ({ highlight }) {
    // TODO(sagar): error handling
    yield axios.post('/api/newsletters/highlight', {
      action: 'highlight',
      newsletterId: highlight.newsletterId,
      digestId: highlight.digestId,
      range: highlight.range,
      highlightId: highlight.id,
      dataset: highlight.dataset,
      content: highlight.content,
    });

    // add highlight to the redux store
    yield put({
      type: Actions.LOAD_HIGHLIGHTS_SUCCEEDED,
      highlights: [
        {
          id: highlight.id,
          newsletterId: highlight.newsletterId,
          digestId: highlight.digestId,
          date: new Date().toISOString(),
          content: highlight.content,
          title: highlight.digestTitle,
        },
      ],
    });
  });
}

function* removeHighlightListener() {
  yield takeEvery(Actions.REMOVE_HIGHLIGHT, function* ({ highlight }) {
    // TODO(sagar): error handling
    yield axios.post('/api/newsletters/highlight', {
      action: 'clearHighlight',
      highlightId: highlight.id,
      newsletterId: highlight.newsletterId,
      digestId: highlight.digestId,
    });
  });
}

function* toggleHideFromSidebarListener() {
  yield takeEvery(
    [Actions.HIDE_FROM_SIDEBAR, Actions.SHOW_IN_SIDEBAR],
    function* () {
      const hiddenPublishers = yield select(
        (state) => state.newsletters?.hiddenPublishers
      );
      yield axios.post('/api/account/updateSettings', {
        settings: { hiddenPublishers },
      });
    }
  );
}

function* captureSelectionChange() {
  const globalListener = { current: null };
  document.addEventListener('selectionchange', () => {
    globalListener.current?.call();
  });

  yield takeEvery(Actions.ATTACH_SELECTION_CHANGE_LISTENER, function* ({
    listener,
  }) {
    globalListener.current = listener;
    yield async () => {};
  });
}

function* sagas() {
  yield all([
    populateListener(),
    loadPublishersListener(),
    loadDigestsListener(),
    updateDigestFiltersListener(),
    loadMoreDigestsListener(),
    loadHighlightsListener(),
    addHighlightListener(),
    removeHighlightListener(),
    toggleHideFromSidebarListener(),
    captureSelectionChange(),
  ]);
}

export { Actions, reducer, sagas };
