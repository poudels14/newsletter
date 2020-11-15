import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { css } from '@emotion/react';

const Button = ({ classNames, pageId, name }) => {
  return (
    <Link
      to={`/admin/${pageId}`}
      css={css(`
        color: inherit;
        font-size: 16px;
        font-weight: 500;
      `)}
    >
      <div
        className={classNames}
        css={css(`
          padding: 5px 14px;
          border: 0 solid rgba(100, 100, 100, 0.2);
          border-bottom-width: 1px;

          &:hover, &.active {
            color: white;
            background: rgb(77, 75, 110); /* rgba(54, 52, 105, 1); */
          }
        `)}
      >
        <span>{name}</span>
      </div>
    </Link>
  );
};
Button.propTypes = {
  pageId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  classNames: PropTypes.string,
};

const Sidebar = (props) => {
  return (
    <div
      css={css(`
        height: 100%;
        background: rgb(40, 40, 54); /* rgb(42, 40, 77); rgb(37, 35, 75); rgb(66, 63, 134); rgba(54, 52, 105, 1); */
        color: white;
        font-size: 16px;
        @media (max-width: 425px) {
          display: none;
        }
      `)}
    >
      <Button
        pageId="users"
        name="Users"
        classNames={classnames({ active: props.pageId === 'users' })}
      />
      <Button
        pageId="newsletters"
        name="Newsletters"
        classNames={classnames({ active: props.pageId === 'newsletters' })}
      />
      <Button
        pageId="runcommand"
        name="Run commands"
        classNames={classnames({ active: props.pageId === 'runcommand' })}
      />
    </div>
  );
};
Sidebar.propTypes = {
  width: PropTypes.string,
  pageId: PropTypes.string,
};

export default Sidebar;
