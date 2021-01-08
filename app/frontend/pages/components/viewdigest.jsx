import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  clearHighlight,
  highlight,
  isTextSelected,
  serializeRange,
} from 'highlighter';
import debounce from 'lodash/debounce';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';
import { css } from '@emotion/react';

import PencilIcon from 'heroicons/outline/pencil.svg';
import AnnotationIcon from 'heroicons/outline/annotation.svg';
import { Actions as NewslettersActions } from '../../controllers/newsletters';
import { Actions as AccountActions } from '../../controllers/account';
import ArticleHeader from './viewdigest/header';

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

const ActionTray = (props) => {
  const highlightStyle = {
    color: props.popoverOptions?.highlightId
      ? 'rgba(12, 242, 150, 0.5'
      : 'white',
  };
  return (
    <div
      css={css(`
        background-color: rgba(40,40,54, 0.9);
        color: #fff;
        text-align: center;
        border-radius: 6px;
        z-index: 1;
        
        &::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: #555 transparent transparent transparent;
        }
      `)}
    >
      <div css={css(` font-size: 20px; `)} className="flex">
        <div
          className="cursor-pointer px-3 py-2"
          style={highlightStyle}
          onClick={props.toggleHighlight}
        >
          <PencilIcon width="20" height="20" />
        </div>
        <div className="border-l border-gray-700"></div>
        <div
          className="cursor-pointer px-3 py-2"
          onClick={() => {
            props.setPopoverOptions({});
            alert('Coming soon!');
          }}
        >
          <AnnotationIcon width="20" height="20" />
        </div>
      </div>
    </div>
  );
};
ActionTray.propTypes = {
  popoverOptions: PropTypes.object,
  setPopoverOptions: PropTypes.func,
  toggleHighlight: PropTypes.func,
  shadowDom: PropTypes.object,
};

const SelectedTextActionPopover = ({ hidePopoverTimer, ...props }) => {
  const { top, left } = props.popoverOptions || {};

  const toggleHighlight = useCallback(() => {
    if (!props.popoverOptions) {
      return;
    }
    const { highlightId } = props.popoverOptions;
    if (highlightId) {
      clearHighlight(`.${highlightId}`, props.shadowDom);
      // TODO(sagar): show error if the request below fails
      axios.post('/api/newsletters/highlight', {
        action: 'clearHighlight',
        newsletterId: props.newsletterId,
        digestId: props.digestId,
        highlightId,
      });
      props.setPopoverOptions({});
    } else {
      const { range } = props.popoverOptions;
      // Note(sagar): serialize first so that DOM modification doens't change range offsets
      const serialized = serializeRange(range, props.shadowDom);
      const dataset = { top, left };

      const uniqueId = `highlight-${(
        new Date().getTime() * 100 +
        Math.floor(Math.random() * 100)
      ).toString(16)}`;
      highlight(range, null, uniqueId, dataset);
      const highlightedElements = props.shadowDom.querySelectorAll(
        `.${uniqueId}`
      );
      highlightedElements.forEach((ele) => {
        ele.addEventListener('mouseenter', () => {
          if (hidePopoverTimer.current) {
            clearTimeout(hidePopoverTimer.current);
            hidePopoverTimer.current = null;
          }
          props.setPopoverOptions({
            highlightId: uniqueId,
            ...props.popoverOptions,
          });
        });
        ele.addEventListener('mouseleave', () => {
          hidePopoverTimer.current = setTimeout(() => {
            props.setPopoverOptions({});
            hidePopoverTimer.current = null;
          }, 150);
        });
      });

      const content = Array.from(highlightedElements)
        .map((x) => x.innerText)
        .join(' ');

      // TODO(sagar): show error if the request below fails
      axios.post('/api/newsletters/highlight', {
        action: 'highlight',
        newsletterId: props.newsletterId,
        digestId: props.digestId,
        range: serialized,
        highlightId: uniqueId,
        dataset,
        content,
      });
      props.setPopoverOptions({});
    }
  }, [props.popoverOptions]);

  if (!props.popoverOptions?.top) {
    return null;
  }
  return (
    <div
      className={'selected-text-action-popover'}
      // TODO(sagar): maybe use popper library instead of passing top/left?
      css={css(`
        position: absolute;
        top: ${top}px;
        left: ${left}px;
        transform: translateX(-50%) translateY(-10px);
      `)}
      onMouseEnter={() => {
        if (hidePopoverTimer.current) {
          clearTimeout(hidePopoverTimer.current);
          hidePopoverTimer.current = null;
        }
      }}
      onMouseLeave={() => {
        hidePopoverTimer.current = setTimeout(() => {
          // Note(sagar): hide highlight tray only if this tray is open when hovering over existing highlights
          //              meaning, don't hide tray when it's shown because of active text selection
          if (props.popoverOptions?.highlightId) {
            props.setPopoverOptions({});
          }
          hidePopoverTimer.current = null;
        }, 200);
      }}
    >
      <ActionTray
        popoverOptions={props.popoverOptions}
        setPopoverOptions={props.setPopoverOptions}
        toggleHighlight={toggleHighlight}
        shadowDom={props.shadowDom}
      />
    </div>
  );
};
SelectedTextActionPopover.propTypes = {
  newsletterId: PropTypes.string.isRequired,
  digestId: PropTypes.string.isRequired,
  container: PropTypes.object,
  shadowDom: PropTypes.object,
  popoverOptions: PropTypes.shape({
    top: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    left: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    range: PropTypes.object,
    highlightId: PropTypes.string,
  }),
  setPopoverOptions: PropTypes.func.isRequired,
  hidePopoverTimer: PropTypes.object,
};

const buildPopoverOptions = (shadowHostContainer, range) => {
  const shadowBoundingRect = shadowHostContainer.getBoundingClientRect();
  const boundingRect = range.getBoundingClientRect();
  const {
    top: shadowBoundingTop,
    left: shadowBoundingLeft,
  } = shadowBoundingRect;
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
          block: 'start',
          inline: 'nearest',
        });
      }
      console.log('loadAndShow done');
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

  console.log('style = ', shadowDom.current?.querySelectorAll('#page-style'));

  return (
    <div className="relative h-full w-full overflow-y-scroll">
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

      <div
        ref={shadowHostContainer}
        css={css(`
          display: flex;
          flex-direction: row;
        `)}
      >
        <div
          ref={shadowHost}
          id={'newsletter-digest-host'}
          css={css(`
            flex: 1 0 400px;
            padding: 40px 0 0 0;
            max-width: ${readerConfig.readerWidth || 600}px;
            margin: auto;

            font-size: ${readerConfig.fontSize}px;
            font-family: ${readerConfig.selectedFont || 'cursive'};
            
            // font-family: cursive;
          `)}
        >
          <div>Loading...</div>
        </div>
      </div>
      <SelectedTextActionPopover
        popoverOptions={popoverOptions}
        setPopoverOptions={setPopoverOptions}
        hidePopoverTimer={hidePopoverTimer}
        container={shadowHostContainer.current}
        shadowDom={shadowDom.current}
        newsletterId={props.newsletterId}
        digestId={props.digestId}
      />
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
  const publisher = (newsletters?.publisherById || {})[ownProps.newsletterId];
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
