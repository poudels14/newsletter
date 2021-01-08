import React from 'react';
import PropTypes from 'prop-types';
import { css } from '@emotion/react';
import classnames from 'classnames';

const Popover = (props) => {
  return (
    <button
      className={classnames(
        'group focus:border-none focus:outline-none',
        props.className
      )}
    >
      {props.anchor}
      <div
        className="absolute bg-white hidden group-focus:block cursor-default rounded-sm border shadow-md"
        css={css(`transform: translate(calc(8px - 50%), 0.5rem)`)}
      >
        <div
          className="absolute transform bg-white rotate-45 -translate-y-1/2 border-l border-t border-gray-400"
          css={css(`width: 10px; height: 10px; left: calc(50% - 5px)`)}
        ></div>
        <div className="p-3 rounded-b-sm">{props.content}</div>
      </div>
    </button>
  );
};
Popover.propTypes = {
  className: PropTypes.string,
  anchor: PropTypes.any.isRequired,
  content: PropTypes.any.isRequired,
};

export default Popover;
