/* global window */
const getDocument = (node) => {
  if (node.nodeType == 9) {
    return node;
  } else if (typeof node.ownerDocument != UNDEF) {
    return node.ownerDocument;
  } else if (typeof node.document != UNDEF) {
    return node.document;
  } else if (node.parentNode) {
    return getDocument(node.parentNode);
  } else {
    throw module.createError("getDocument: no document found for node");
  }
};

const getNodeIndex = (node) => {
  var i = 0;
  while ((node = node.previousSibling)) {
    ++i;
  }
  return i;
};

const serializePosition = (node, offset, rootNode) => {
  var pathParts = [],
    n = node;
  rootNode = rootNode || getDocument(node).documentElement;
  while (n && n != rootNode) {
    pathParts.push(getNodeIndex(n, true));
    n = n.parentNode;
  }
  return pathParts.join("/") + ":" + offset;
};

const deserializePosition = (serialized, rootNode, doc) => {
  if (!rootNode) {
    rootNode = (doc || window.document).documentElement;
  }
  var parts = serialized.split(":");
  var node = rootNode;
  var nodeIndices = parts[0] ? parts[0].split("/") : [],
    i = nodeIndices.length,
    nodeIndex;

  while (i--) {
    nodeIndex = parseInt(nodeIndices[i], 10);
    if (nodeIndex < node.childNodes.length) {
      node = node.childNodes[nodeIndex];
    } else {
      throw `deserializePosition() failed: node ${node} has no child with index ${nodeIndex}, ${i}`;
    }
  }

  return { node, offset: parseInt(parts[1], 10) };
};

const serializeRange = (range, rootNode) => {
  const { startContainer, startOffset, endContainer, endOffset } = range;
  const start = serializePosition(startContainer, startOffset, rootNode);
  const end = serializePosition(endContainer, endOffset, rootNode);
  return { start, end };
};

const deserializeRange = (serializedRange, rootNode, doc) => {
  const { start, end } = serializedRange;
  const startNode = deserializePosition(start, rootNode, doc);
  const endNode = deserializePosition(end, rootNode, doc);

  const range = (doc || window.document).createRange();

  range.setStart(startNode.node, startNode.offset);
  range.setEnd(endNode.node, endNode.offset);

  return range;
};

const dfsHighlight = (node, endNode, doc) => {
  const childNodes = Array.from(node.childNodes);
  if (childNodes.length === 0) {
    // leaf node
    if (node.nodeType === 3) {
      const span = (doc || window.document).createElement("span");
      span.textContent = node.textContent;
      span.classList.add("newsletter-highlight");
      node.parentNode.replaceChild(span, node);
    } else {
      node.classList.add("newsletter-highlight");
    }
  }
  if (node.isEqualNode(endNode)) {
    return true; // endReached
  }
  for (let i = 0; i < childNodes.length; i++) {
    const endReached = dfsHighlight(childNodes[i], endNode, doc);
    if (endReached) {
      return true;
    }
  }
  return false;
};

const highlightBetween = (startNode, endNode, doc) => {
  const parentNode = startNode.parentNode;
  let endReached = false;
  let currentNode = startNode;
  while (currentNode) {
    const nextSibling = currentNode.nextSibling;
    endReached = dfsHighlight(currentNode, endNode, doc);
    if (endReached) {
      return;
    }
    currentNode = nextSibling;
  }

  if (!endReached) {
    highlightBetween(parentNode.nextSibling, endNode, doc);
  }
};

const isTextSelected = (range) => {
  const { startContainer, startOffset, endContainer, endOffset } = range;
  return !(
    startContainer.isEqualNode(endContainer) && startOffset == endOffset
  );
};

const highlight = (range, doc) => {
  const { startContainer, startOffset, endContainer, endOffset } = range;
  // TODO(sagar): start and end containers maynot always be text node; in that case, splitting won't work
  endContainer.splitText(endOffset);
  startContainer.splitText(startOffset);
  const startNode = startContainer.nextSibling;
  let endNode = endContainer;

  if (startContainer.isEqualNode(endContainer)) {
    // If startContainer and endContainer are same, endNode will be same as startNode
    // this reassignment is necessssary only when they are same
    endNode = startNode;
  }
  highlightBetween(startNode, endNode, doc);
};

module.exports = {
  isTextSelected,
  highlight,
  serializePosition,
  deserializePosition,
  serializeRange,
  deserializeRange,
};
