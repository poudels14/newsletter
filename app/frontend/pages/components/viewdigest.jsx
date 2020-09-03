import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  clearHighlight,
  highlight,
  isTextSelected,
  serializeRange,
} from 'highlighter';

import { HighlightOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import axios from 'axios';
import { css } from '@emotion/core';

const bindHighlights = ({ dom, timerRef, setPopoverOptions }) => {
  const highlightedElements = dom.querySelectorAll(`.newsletter-highlight`);
  highlightedElements.forEach((ele) => {
    const { top, left } = ele.dataset;
    const highlightId = Array.from(ele.classList).find((s) =>
      s.startsWith('highlight-')
    );
    ele.addEventListener('mouseenter', () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setPopoverOptions({
        highlightId,
        top,
        left,
      });
    });
    ele.addEventListener('mouseleave', () => {
      timerRef.current = setTimeout(() => {
        setPopoverOptions({});
        timerRef.current = null;
      }, 150);
    });
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
        padding: 8px 20px;
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
      <div css={css(` font-size: 20px; `)}>
        <HighlightOutlined
          onClick={props.toggleHighlight}
          style={highlightStyle}
        />
        {/* <div css={css(`display: inline-block; width: 20px;`)}></div>
        <MessageOutlined /> */}
      </div>
    </div>
  );
};
ActionTray.propTypes = {
  popoverOptions: PropTypes.object,
  toggleHighlight: PropTypes.func,
  shadowDom: PropTypes.object,
};

const SelectedTextActionPopover = ({ hidePopoverTimer, ...props }) => {
  const { top, left } = props.popoverOptions || {};

  const highlightSelected = useCallback(() => {
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

      const highlightId = highlight(range, null, dataset);
      const highlightedElements = props.shadowDom.querySelectorAll(
        `.${highlightId}`
      );
      highlightedElements.forEach((ele) => {
        ele.addEventListener('mouseenter', () => {
          if (hidePopoverTimer.current) {
            clearTimeout(hidePopoverTimer.current);
            hidePopoverTimer.current = null;
          }
          props.setPopoverOptions({
            highlightId,
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

      // TODO(sagar): show error if the request below fails
      axios.post('/api/newsletters/highlight', {
        action: 'highlight',
        newsletterId: props.newsletterId,
        digestId: props.digestId,
        range: serialized,
        dataset,
      });
      props.setPopoverOptions({});
    }
  }, [props.popoverOptions]);

  return (
    <div
      className={'selected-text-action-popover'}
      // TODO(sagar): maybe use popper library instead of passing top/left?
      css={css(`
        position: absolute;
        top: ${top}px;
        left: ${left}px;
        display: ${props.popoverOptions?.top !== undefined ? 'block' : 'none'};
        transform: translateX(-100%) translateY(calc(-100% - 10px));
      `)}
      onMouseEnter={() => {
        if (hidePopoverTimer.current) {
          clearTimeout(hidePopoverTimer.current);
          hidePopoverTimer.current = null;
        }
      }}
      onMouseLeave={() => {
        hidePopoverTimer.current = setTimeout(() => {
          props.setPopoverOptions({});
          hidePopoverTimer.current = null;
        }, 100);
      }}
    >
      <ActionTray
        popoverOptions={props.popoverOptions}
        toggleHighlight={highlightSelected}
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
  const boundingRect = range.getBoundingClientRect();
  const { top, left, width } = boundingRect;

  if (!isTextSelected(range)) {
    return {};
  }

  return {
    top:
      Math.round(top) +
      shadowHostContainer.scrollTop -
      shadowHostContainer.getBoundingClientRect().top,
    left: Math.round(left + width / 2),
    range,
  };
};

const loadAndShowDigest = (
  dom,
  newsletterId,
  digestId,
  hidePopoverTimer,
  setPopoverOptions
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
          &:before, &:after {
            box-sizing: inherit;
          }
        }
        .newsletter-highlight:hover {
          background-color: rgba(12, 242, 150, 0.9);
        }
      `;
      dom.appendChild(shadowStyle);

      bindHighlights({ dom, timerRef: hidePopoverTimer, setPopoverOptions });
    });
};

const ViewDigest = (props) => {
  const shadowHostContainer = useRef(null);
  const shadowHost = useRef(null);
  const shadowDom = useRef(null);
  const hidePopoverTimer = useRef();
  const [popoverOptions, setPopoverOptions] = useState();

  useEffect(() => {
    shadowDom.current = shadowHost.current.attachShadow({ mode: 'open' });
    loadAndShowDigest(
      shadowDom.current,
      props.newsletterId,
      props.digestId,
      hidePopoverTimer,
      setPopoverOptions
    );
  }, [props.newsletterId, props.digestId, shadowHost]);

  const showActionPopover = useCallback(() => {
    const range = shadowDom.current.getSelection().getRangeAt(0);
    setPopoverOptions(buildPopoverOptions(shadowHostContainer?.current, range));
  }, [shadowHostContainer.current, shadowDom.current]);

  return (
    <div
      ref={shadowHostContainer}
      css={css(`
        position: relative;
        width: 100%;
        height: 100%;
        overflow-y: scroll;
      `)}
    >
      <div
        ref={shadowHostContainer}
        css={css(`
          position: relative;
          display: flex;
          flex-direction: row;
        `)}
      >
        <div
          ref={shadowHost}
          onMouseUp={showActionPopover}
          css={css(`
            flex: 1 0 400px;
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
};

export { ViewDigest };
