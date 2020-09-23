import React, { useEffect } from 'react';

import { Actions } from '../../controllers/newsletters';
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
        font-size: 16px;
        font-weight: 500;

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
            color: white;
            background: rgb(77, 75, 110); /* rgba(54, 52, 105, 1); */
            background: #2c3a61;
          }
        `)}
      >
        <span>{name || authorEmail}</span>
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
  authorEmail: PropTypes.string,
  totalUnread: PropTypes.number,
  classNames: PropTypes.string,
};

const NewslettersSidebar = (props) => {
  useEffect(() => {
    props.loadPublishers();
  }, []);
  return (
    <Layout.Sider
      width={props.width}
      css={css(`
        // background: rgb(40, 40, 54); /* rgb(42, 40, 77); rgb(37, 35, 75); rgb(66, 63, 134); rgba(54, 52, 105, 1); */
        //background: #001529;
        background: #1c253e;
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

        <div
          css={css(`
            display: inline-block;
            margin-left: 20px;
          `)}
        >
          <Link
            to={`/settings`}
            css={css(`
              display: inline-block;
              margin-left: 20px;
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
  loadPublishers: PropTypes.func.isRequired,
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

const mapDispatchToProps = (dispatch) => {
  return {
    loadPublishers: () => dispatch({ type: Actions.LOAD_PUBLISHERS }),
  };
};

const connectedNewslettersSidebar = connect(
  mapStateToProps,
  mapDispatchToProps
)(NewslettersSidebar);

export { connectedNewslettersSidebar as NewslettersSidebar };
