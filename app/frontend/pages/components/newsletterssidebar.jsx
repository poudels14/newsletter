import React from 'react';

import { Layout } from 'antd';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { SettingOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { css } from '@emotion/core';

const Button = ({ classNames, id, name, authorEmail, totalUnread }) => {
  return (
    <Link
      to={`/nl/${id}`}
      css={css(`
        color: inherit;
        font-size: 14px;

        &:hover, &.active {
          color: inherit;
        }
      `)}
    >
      <div
        className={classNames}
        css={css(`
          padding: 5px 14px;
          border: 0 solid rgba(100, 100, 100, 0.2);
          border-bottom-width: 1px;
          &:hover, &.active {
            color: var(--active-tab-color);
            background: var(--active-tab-background);
          }
        `)}
      >
        <span>{name || authorEmail}</span>
        {totalUnread !== 0 && (
          <div
            css={css(`
              display: inline-block;
              background: var(--unread-digests-count-background-color);
              padding: 0 4px;
              border-radius: 2px;
              margin-left: 5px;
              font-size: 11px;

              text-align:center;
              vertical-align: middle;
            `)}
          >
            {totalUnread}
          </div>
        )}
      </div>
    </Link>
  );
};
Button.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  authorEmail: PropTypes.string,
  totalUnread: PropTypes.number,
  classNames: PropTypes.string,
};

const NewslettersSidebar = (props) => {
  return (
    <Layout.Sider
      width={props.width}
      css={css(`
        background: var(--background);
        color: var(--text-color);
        box-shadow: var(--sidebar-box-shadow);
      `)}
      className="newsletters-sidebar"
    >
      <div
        css={css(`
          padding: 15px 14px;
          font-size: 18px;
          font-weight: 700;
        `)}
      >
        <span
          css={css(`
            color: var(--user-name-text-color);
          `)}
        >
          {props.user?.firstName} {props.user?.lastName}
        </span>
        <div
          css={css(`
            display: inline-block;
            margin-left: 20px;
          `)}
        >
          <Link
            to={`/settings`}
            css={css(`
              color: inherit;
              &:hover {
                color: inherit;
              }
            `)}
          >
            <SettingOutlined />
          </Link>
        </div>
      </div>
      {props.publishers && (
        <>
          <Button
            id=""
            name="All"
            classNames={classnames({
              active: props.selectedNewsletterId === undefined,
            })}
          />
          {props.publishers.map((publisher, i) => {
            return (
              <Button
                {...publisher}
                key={i}
                classNames={classnames({
                  active: props.selectedNewsletterId === publisher.id,
                })}
              />
            );
          })}
          <Button
            id="unknown"
            name="Unknown"
            classNames={classnames({
              active: props.selectedNewsletterId === 'unknown',
            })}
          />
        </>
      )}
    </Layout.Sider>
  );
};
NewslettersSidebar.propTypes = {
  width: PropTypes.string,
  newsletters: PropTypes.array,

  /** Redux */
  user: PropTypes.object,
  selectedNewsletterId: PropTypes.string,
  publishers: PropTypes.array,
};

/** Redux */

const mapStateToProps = (state) => {
  const { account, newsletters } = state;
  return {
    user: account?.user,
    selectedNewsletterId: newsletters?.digestFilters?.newsletterId,
    publishers: newsletters?.publishers,
  };
};

const connectedNewslettersSidebar = connect(mapStateToProps)(
  NewslettersSidebar
);

export { connectedNewslettersSidebar as NewslettersSidebar };
