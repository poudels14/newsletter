import 'antd/dist/antd.css';

import { Divider, Popover } from 'antd';
import { Edit3, MessageSquare } from 'react-feather';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import PropTypes from 'prop-types';
import axios from 'axios';
import { css } from '@emotion/core';

const HightlightTray = (props) => {
  const highlightSelection = useCallback(() => {
    props.focusNode.splitText(props.focusOffset);
    props.anchorNode.splitText(props.anchorOffset);
    const startNode = props.anchorNode.nextSibling;
    let endNode = props.focusNode;

    if (props.anchorNode.isEqualNode(props.focusNode)) {
      // If anchorNode and focusNode are same, endNode will be same as startNode
      // this reassignment is necessssary only when they are same
      endNode = startNode;
    }

    highlight(startNode, endNode);
    props.setHightlightTray({});
  }, [props.anchorNode.nextSibling, props.anchorNode, props.focusNode]);

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
  anchorNode: PropTypes.object,
  anchorOffset: PropTypes.number,
  focusNode: PropTypes.object,
  focusOffset: PropTypes.number,
  setHightlightTray: PropTypes.func.isRequired,
};

const dfsHighlight = (node, endNode) => {
  const childNodes = Array.from(node.childNodes);
  if (childNodes.length === 0) {
    // leaf node
    if (node.nodeType === 3) {
      const span = document.createElement('span');
      span.textContent = node.textContent;
      span.classList.add('newsletter-highlight');
      node.parentNode.replaceChild(span, node);
    } else {
      node.classList.add('newsletter-highlight');
    }
  }
  if (node.isEqualNode(endNode)) {
    return true; // endReached
  }
  for (let i = 0; i < childNodes.length; i++) {
    const endReached = dfsHighlight(childNodes[i], endNode);
    if (endReached) {
      return true;
    }
  }
  return false;
};

const highlight = (startNode, endNode) => {
  const parentNode = startNode.parentNode;
  let endReached = false;
  let currentNode = startNode;
  while (currentNode) {
    const nextSibling = currentNode.nextSibling;
    endReached = dfsHighlight(currentNode, endNode);
    if (endReached) {
      return;
    }
    currentNode = nextSibling;
  }

  if (!endReached) {
    highlight(parentNode.nextSibling, endNode);
  }
};

const showHighlightButton = (e, shadowDom, domEle, setHightlightTray) => {
  const selection = shadowDom.getSelection();

  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
  const textSelected = !(
    anchorNode.isEqualNode(focusNode) && anchorOffset == focusOffset
  );

  const range = selection.getRangeAt(0);
  const boundingRect = range.getBoundingClientRect();
  const { top, left, width } = boundingRect;

  setHightlightTray({
    textSelected: textSelected,
    top:
      Math.round(top) + domEle.scrollTop - domEle.getBoundingClientRect().top,
    left: Math.round(left + width / 2),
    range,
    anchorNode,
    anchorOffset,
    focusNode,
    focusOffset,
  });
};

const ViewDigest = (props) => {
  const domEle = useRef(null);
  const shadowHost = useRef(null);
  const shadowDom = useRef(null);
  useEffect(() => {
    axios
      .get(props.url)
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
  }, [props.url, shadowHost]);

  const [hightlight, setHightlightTray] = useState();

  const showHighlightButtonCallback = useCallback(
    (e) => {
      showHighlightButton(
        e,
        shadowDom?.current,
        domEle?.current,
        setHightlightTray
      );
    },
    [domEle?.current, shadowDom?.current]
  );

  return (
    <div
      ref={domEle}
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
      {hightlight?.textSelected && (
        <HightlightTray
          {...hightlight}
          setHightlightTray={setHightlightTray}
          container={domEle.current}
        />
      )}
    </div>
  );
};
ViewDigest.propTypes = {
  url: PropTypes.string.isRequired,
};

export { ViewDigest };
