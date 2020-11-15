import React from 'react';
import classnames from 'classnames';
import { css } from '@emotion/react';
import PropTypes from 'prop-types';

const Switch = ({
  className,
  checked,
  checkedChildren,
  unCheckedChildren,
  toggle,
}) => {
  return (
    <button
      className={classnames(
        'relative border select-none rounded-full focus:outline-none focus:shadow-outline bg-blue-800 border-blue-800',
        className
      )}
      css={css(`
        height: 24px;
        font-size: 13px;
        line-height: 20px;
      `)}
      onClick={() => toggle(!checked)}
    >
      <div
        className={classnames(
          'absolute inline-block rounded-full bg-white transition-all duration-300 ease-in-out'
        )}
        css={css(`
          height: 20px;
          width: 20px;
          top: 1px;
          ${checked ? 'left: calc(100% - 21px)' : 'left: 1px'}
        `)}
      ></div>

      <div
        className="inline-block px-2 text-white font-bold transition-all duration-300 ease-in-out"
        css={css(`
          ${checked ? 'margin-right: 20px;' : 'margin-left: 20px;'}
        `)}
      >
        {checked ? checkedChildren : unCheckedChildren}
      </div>
    </button>
  );
};
Switch.propTypes = {
  className: PropTypes.string,
  checked: PropTypes.bool,
  checkedChildren: PropTypes.any,
  unCheckedChildren: PropTypes.any,
  toggle: PropTypes.func,
};
export default Switch;
