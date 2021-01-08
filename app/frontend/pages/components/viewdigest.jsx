import React, { useCallback, useEffect, useRef, useState } from 'react';
import { isTextSelected } from 'highlighter';
import debounce from 'lodash/debounce';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';
import { css } from '@emotion/react';

import { Actions as NewslettersActions } from '../../controllers/newsletters';
import { Actions as AccountActions } from '../../controllers/account';
import ArticleHeader from './viewdigest/header';
import SelectedTextActionPopover from './viewdigest/selectedTextActionPopover';

const bindHighlights = ({ dom, timerRef, setPopoverOptions }) => {
  const highlightedElements = dom.querySelectorAll(`.newsletter-highlight`);
  highlightedElements.forEach((ele) => {
    const { top, left } = ele.dataset;
    const highlightId = Array.from(ele.classList).find((s) =>
      s.startsWith('highlight-')
    );
    const showPopover = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setPopoverOptions({
        highlightId,
        top,
        left,
      });
    };

    const hidePopover = () => {
      timerRef.current = setTimeout(() => {
        setPopoverOptions({});
        timerRef.current = null;
      }, 200);
    };
    ele.addEventListener('mouseenter', showPopover);
    ele.addEventListener('mouseleave', hidePopover);

    ele.addEventListener('click', showPopover);
  });
};

const buildPopoverOptions = (shadowHostContainer, range) => {
  const shadowBoundingRect = shadowHostContainer.getBoundingClientRect();
  const {
    top: shadowBoundingTop,
    left: shadowBoundingLeft,
  } = shadowBoundingRect;

  const boundingRect = range.getBoundingClientRect();
  const { top, left, right } = boundingRect;

  if (!isTextSelected(range)) {
    return {};
  }

  return {
    top: Math.round(top) + shadowHostContainer.scrollTop - shadowBoundingTop,
    left: Math.round(
      (left + right) / 2 + shadowHostContainer.scrollLeft - shadowBoundingLeft
    ),
    range,
  };
};

const loadAndShowDigest = (
  dom,
  newsletterId,
  digestId,
  hidePopoverTimer,
  setPopoverOptions,
  scrollToHighlightId
) => {
  axios
    .get(`/api/newsletters/view/${newsletterId}/${digestId}`)
    .then((respose) => respose.data)
    .then((data) => {
      dom.innerHTML = data;

      const shadowStyle = document.createElement('style');
      shadowStyle.innerHTML = `
        .newsletter-highlight {
          cursor: pointer;
          box-sizing: border-box;
          background-color: rgba(12, 242, 150, 0.5);
          user-select: none;
        }
        .newsletter-highlight:hover {
          background-color: rgba(12, 242, 150, 0.9);
        }
      `;
      dom.appendChild(shadowStyle);

      bindHighlights({ dom, timerRef: hidePopoverTimer, setPopoverOptions });

      if (scrollToHighlightId) {
        dom.querySelector(`.${scrollToHighlightId}`).scrollIntoView({
          // TODO(sagar): smooth scrolling didn't work sometimes, so using default 'auto' scrolling for now
          //              try to make smooth scrolling
          block: 'center',
          inline: 'nearest',
        });
      }
    });
};

const ViewDigest = (props) => {
  const shadowHostContainer = useRef(null);
  const shadowHost = useRef(null);
  const shadowDom = useRef(null);
  const hidePopoverTimer = useRef();
  const [popoverOptions, setPopoverOptions] = useState();
  const readerConfig = props.readerConfig || {};

  const showActionPopover = useCallback(
    debounce(() => {
      // Note(sagar): run this after timeout so that selection is updated before this is executed
      const selection = shadowDom.current.getSelection
        ? shadowDom.current.getSelection()
        : window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const options = buildPopoverOptions(
          shadowHostContainer?.current,
          range
        );
        setPopoverOptions(options);
      }
    }, 200),
    [shadowHostContainer.current, shadowDom.current]
  );

  useEffect(() => {
    props.attachSelectionChangeListener(showActionPopover);
    return () => {
      props.attachSelectionChangeListener(null);
    };
  }, [showActionPopover]);

  useEffect(() => {
    const scrollToHighlightId = window.location.hash?.startsWith('#highlight-')
      ? window.location.hash.substr(1)
      : null;
    shadowDom.current = shadowHost.current.attachShadow({ mode: 'open' });
    loadAndShowDigest(
      shadowDom.current,
      props.newsletterId,
      props.digestId,
      hidePopoverTimer,
      setPopoverOptions,
      scrollToHighlightId
    );
  }, [props.newsletterId, props.digestId, shadowHost]);

  return (
    <div className="h-full w-full flex flex-col">
      <ArticleHeader
        title={props.digest?.title}
        publisherName={props.publisher?.name}
        readerConfig={readerConfig}
        updateReaderConfig={props.updateReaderConfig}
        digestConfig={props.digest?.config}
        updateDigestConfig={(config) =>
          props.updateDigestConfig(props.digestId, config)
        }
      />
      <div className="relative overflow-y-scroll">
        <div
          ref={shadowHostContainer}
          css={css(`
            display: flex;
            flex-direction: row;
            height: 100%;
          `)}
        >
          <div
            ref={shadowHost}
            id={'newsletter-digest-host'}
            css={css(`
              flex: 1 0 400px;
              padding: 40px 0 0 0;
              margin: auto;

              max-width: ${readerConfig.readerWidth || 600}px;
              // font-size: ${readerConfig.fontSize}px;
              // font-family: ${readerConfig.selectedFont || 'cursive'};
            `)}
          >
            <div>Loading...</div>
          </div>
        </div>

        <SelectedTextActionPopover
          popoverOptions={popoverOptions}
          setPopoverOptions={setPopoverOptions}
          hidePopoverTimer={hidePopoverTimer}
          shadowDom={shadowDom.current}
          newsletterId={props.newsletterId}
          digestId={props.digestId}
          digestTitle={props.digest?.title}
        />
      </div>
    </div>
  );
};
ViewDigest.propTypes = {
  newsletterId: PropTypes.string.isRequired,
  digestId: PropTypes.string.isRequired,
  /** Redux props */
  publisher: PropTypes.object,
  digest: PropTypes.object,
  updateDigestConfig: PropTypes.func,
  readerConfig: PropTypes.object,
  updateReaderConfig: PropTypes.func,
  attachSelectionChangeListener: PropTypes.func,
};

/** Redux */
const mapStateToProps = (state, ownProps) => {
  const { newsletters, account } = state;
  const publisher = (newsletters?.publishersById || {})[ownProps.newsletterId];
  return {
    digest: newsletters?.digests?.find((d) => d.id === ownProps.digestId),
    readerConfig: account?.user?.settings?.readerConfig,
    publisher,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateDigestConfig: (digestId, config) => {
      dispatch({
        type: NewslettersActions.UPDATE_DIGEST_CONFIG,
        digestId,
        config,
      });
    },
    updateReaderConfig: (config) => {
      dispatch({ type: AccountActions.UPDATE_READER_CONFIG, config });
    },
    attachSelectionChangeListener: (listener) =>
      dispatch({
        type: NewslettersActions.ATTACH_SELECTION_CHANGE_LISTENER,
        listener,
      }),
  };
};

const connectedViewDigest = connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewDigest);

export { connectedViewDigest as ViewDigest };
