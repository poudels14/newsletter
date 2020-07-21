import 'antd/dist/antd.css';

import { Divider, Popover } from 'antd';
import { Edit3, MessageSquare } from 'react-feather';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { highlight, isTextSelected, serializeRange } from 'highlighter';

import PropTypes from 'prop-types';
import axios from 'axios';
import { css } from '@emotion/core';

const HightlightTray = (props) => {
  const highlightSelection = useCallback(() => {
    const serialized = serializeRange(props.range, props.shadowDom);
    highlight(props.range);

    axios.post('/api/newsletters/highlight', {
      newsletterId: props.newsletterId,
      digestId: props.digestId,
      range: serialized,
    });
    props.setHightlightTray({});
  }, [props.range]);

  const Tray = useCallback(() => {
    return (
      <div css={css({ height: '20px' })}>
        <Edit3 size={20} onClick={highlightSelection} />
        <Divider type="vertical" />
        <MessageSquare size={20} />
      </div>
    );
  }, [highlightSelection]);

  return (
    <Popover
      placement="top"
      content={Tray}
      getPopupContainer={() => props.container}
      visible={props} // Note(sagar): This is to rerender Popover when props is changed
    >
      <div
        css={css({
          position: 'absolute',
          top: `${props.top}px`,
          left: props.left,
        })}
      ></div>
    </Popover>
  );
};
HightlightTray.propTypes = {
  container: PropTypes.object,
  top: PropTypes.number,
  left: PropTypes.number,
  startContainer: PropTypes.object,
  startOffset: PropTypes.number,
  endContainer: PropTypes.object,
  endOffset: PropTypes.number,
  setHightlightTray: PropTypes.func.isRequired,
};

const showHighlightButton = (
  e,
  shadowDom,
  shadowHostContainer,
  setHightlightTray
) => {
  const selection = shadowDom.getSelection();

  const range = selection.getRangeAt(0);
  const boundingRect = range.getBoundingClientRect();
  const { top, left, width } = boundingRect;

  setHightlightTray({
    top:
      Math.round(top) +
      shadowHostContainer.scrollTop -
      shadowHostContainer.getBoundingClientRect().top,
    left: Math.round(left + width / 2),
    isTextSelected: isTextSelected(range),
    range,
  });
};

const ViewDigest = (props) => {
  const shadowHostContainer = useRef(null);
  const shadowHost = useRef(null);
  const shadowDom = useRef(null);
  useEffect(() => {
    axios
      .get(`/api/newsletters/view/${props.newsletterId}/${props.digestId}`)
      .then((respose) => respose.data)
      .then((data) => {
        const shadow = shadowHost.current.attachShadow({ mode: 'open' });
        shadow.innerHTML = data;

        const shadowStyle = document.createElement('style');
        shadowStyle.innerHTML = `
          .newsletter-highlight {
            color: red;
            background: #ffee2673;
          }
        `;
        shadow.appendChild(shadowStyle);

        shadowDom.current = shadow;
      });
  }, [props.digestId, shadowHost]);

  const [hightlight, setHightlightTray] = useState();

  const showHighlightButtonCallback = useCallback(
    (e) => {
      showHighlightButton(
        e,
        shadowDom?.current,
        shadowHostContainer?.current,
        setHightlightTray
      );
    },
    [shadowHostContainer.current, shadowDom.current]
  );

  return (
    <div
      ref={shadowHostContainer}
      css={css({
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        overflowY: 'scroll',
      })}
    >
      <div
        ref={shadowHost}
        onMouseUp={showHighlightButtonCallback}
        css={css({ flex: '1 0 400px' })}
      >
        <div>Loading...</div>
      </div>
      <div css={css({ flex: '0 0 200px', height: '100px', background: 'red' })}>
        {/* {selection} */}
      </div>
      {hightlight?.isTextSelected && (
        <HightlightTray
          {...hightlight}
          setHightlightTray={setHightlightTray}
          container={shadowHostContainer.current}
          shadowDom={shadowDom.current}
          newsletterId={props.newsletterId}
          digestId={props.digestId}
        />
      )}
    </div>
  );
};
ViewDigest.propTypes = {
  digestId: PropTypes.string.isRequired,
};

export { ViewDigest };
