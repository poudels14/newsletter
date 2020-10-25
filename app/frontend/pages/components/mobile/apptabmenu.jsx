import React, { useEffect } from 'react';
import classnames from 'classnames';
import { Actions } from '../../../controllers/newsletters';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { css } from '@emotion/core';
import { Divider as AntDivider } from 'antd';
import { Link } from 'react-router-dom';
import { HomeFilled, HighlightFilled, SettingFilled } from '@ant-design/icons';

const MenuItem = (props) => {
  return (
    <Link
      to={props.url}
      className={props.className}
      css={css(`
        flex: 1;
        text-align: center;
        color: inherit;
        font-size: 14px;

        &:hover, &.active {
          background: var(--active-tab-background);
          color: var(--active-tab-text-color);
        }
      `)}
    >
      {props.children}
    </Link>
  );
};
MenuItem.propTypes = {
  url: PropTypes.string.isRequired,
  className: PropTypes.string,
  children: PropTypes.any,
};

const Divider = () => {
  return (
    <AntDivider
      css={css(`
        background: var(--divider-color);
        height: 40px;
        margin: 0;
      `)}
      orientation="center"
      type="vertical"
    />
  );
};

const AppTabMenu = (props) => {
  return (
    <div
      css={css(`
        display: none;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 40px;
        line-height: 40px;
        background: var(--background);
        color: var(--text-color);
        box-shadow: var(--box-shadow);
        display: flex;
        flex-direction: row;
      `)}
      className="mobile-tabmenu"
    >
      <MenuItem
        url="/"
        className={classnames({
          active: props.active === 'homepage',
        })}
      >
        <HomeFilled />
      </MenuItem>

      <Divider />

      <MenuItem
        url="/highlights"
        className={classnames({
          active: props.active === 'highlights',
        })}
      >
        <HighlightFilled />
      </MenuItem>

      <Divider />
      <MenuItem
        url="/settings"
        className={classnames({
          active: props.active === 'settings',
        })}
      >
        <SettingFilled />
      </MenuItem>
    </div>
  );
};
AppTabMenu.propTypes = {
  active: PropTypes.string,
  /** Redux props */
  user: PropTypes.object,
  status: PropTypes.object,
};

/** Redux */
const mapStateToProps = (state) => {
  const { newsletters, account } = state;
  return {
    user: account?.user,
    status: newsletters?.populateStatus,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

const connectedAppTabMenu = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppTabMenu);

export default connectedAppTabMenu;
