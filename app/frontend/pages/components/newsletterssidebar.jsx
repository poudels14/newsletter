import { Layout } from 'antd';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import { SettingOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { css } from '@emotion/core';

const Button = ({ classNames, id, name, totalUnread }) => {
  return (
    <Link
      to={`/nl/${id}`}
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
        {totalUnread !== 0 && (
          <div
            css={css(`
              display: inline-block;
              background: rgb(97, 97, 97);
              padding: 0 4px;
              border-radius: 2px;
              margin-left: 5px;
              font-size: 12px;

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
  totalUnread: PropTypes.number,
  classNames: PropTypes.string,
};

const NewslettersSidebar = (props) => {
  return (
    <Layout.Sider
      width={props.width}
      css={css(`
        background: white;

        background: rgb(40, 40, 54); /* rgb(42, 40, 77); rgb(37, 35, 75); rgb(66, 63, 134); rgba(54, 52, 105, 1); */
        color: white;
        font-size: 16px;
        @media (max-width: 425px) {
          display: none;
        }
      `)}
    >
      <div
        css={css(`
          padding: 15px 14px;
          font-size: 18px;
          font-weight: 700;
        `)}
      >
        <span>
          {props.user?.firstName} {props.user?.lastName}
        </span>
        {props.user?.isAdmin && (
          <div
            css={css(`
              display: inline-block;
              margin-left: 20px;
            `)}
          >
            <Link
              to={`/admin`}
              css={css(`
                color: inherit;
              `)}
            >
              <SettingOutlined />
            </Link>
          </div>
        )}
      </div>
      <Button
        id=""
        name="All"
        classNames={classnames({
          active: props.selectedPublisher === undefined,
        })}
      />
      {props.publishers &&
        props.publishers.map((publisher, i) => {
          return (
            <Button
              {...publisher}
              key={i}
              classNames={classnames({
                active: props.selectedPublisher === publisher.id,
              })}
            />
          );
        })}
    </Layout.Sider>
  );
};
NewslettersSidebar.propTypes = {
  width: PropTypes.string,
  newsletters: PropTypes.array,

  /** Redux */
  user: PropTypes.object,
  selectedPublisher: PropTypes.string,
  publishers: PropTypes.array,
};

/** Redux */

const mapStateToProps = (state) => {
  const { account, newsletters } = state;
  return {
    user: account?.user,
    selectedPublisher: newsletters?.selectedPublisher,
    publishers: newsletters?.publishers,
  };
};

const connectedNewslettersSidebar = connect(mapStateToProps)(
  NewslettersSidebar
);

export { connectedNewslettersSidebar as NewslettersSidebar };
