import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { css } from '@emotion/react';
import { connect } from 'react-redux';

import { clearHighlight, highlight, serializeRange } from 'highlighter';
import PencilIcon from 'heroicons/outline/pencil.svg';
import AnnotationIcon from 'heroicons/outline/annotation.svg';

import { Actions as NewslettersActions } from '../../../controllers/newsletters';

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
      props.removeHighlight({
        id: highlightId,
        newsletterId: props.newsletterId,
        digestId: props.digestId,
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
      props.addHighlight({
        id: uniqueId,
        digestTitle: props.digestTitle,
        newsletterId: props.newsletterId,
        digestId: props.digestId,
        range: serialized,
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
          transform: translateX(-50%) translateY(calc(-100% - 10px));
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
  digestTitle: PropTypes.string,
  shadowDom: PropTypes.object,
  popoverOptions: PropTypes.shape({
    top: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    left: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    range: PropTypes.object,
    highlightId: PropTypes.string,
  }),
  setPopoverOptions: PropTypes.func.isRequired,
  hidePopoverTimer: PropTypes.object,

  /** Redux props */
  addHighlight: PropTypes.func,
  removeHighlight: PropTypes.func,
};

/** Redux */

const mapDispatchToProps = (dispatch) => {
  return {
    addHighlight: (highlight) => {
      dispatch({
        type: NewslettersActions.ADD_HIGHLIGHT,
        highlight,
      });
    },
    removeHighlight: (highlight) => {
      dispatch({ type: NewslettersActions.REMOVE_HIGHLIGHT, highlight });
    },
  };
};

export default connect(null, mapDispatchToProps)(SelectedTextActionPopover);
