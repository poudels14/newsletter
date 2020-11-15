import React from 'react';

import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import SettingsIcon from 'heroicons/outline/cog.svg';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { css } from '@emotion/react';

const Button = ({ id, name, authorEmail, totalUnread, active }) => {
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
        className={classnames(
          'tab-menu-item  hover:bg-gray-200 border-t border-gray-400',
          {
            'active text-gray-900 bg-gray-300': active,
          }
        )}
        css={css(`
          padding: 5px 14px;
        `)}
      >
        <span>{name || authorEmail}</span>
        {totalUnread !== 0 && (
          <div
            css={css(`
              font-size: 11px;
            `)}
            className="bg-gray-200 px-1 rounded-sm ml-3 inline-block text-center align-middle"
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
  active: PropTypes.bool,
};

const NewslettersSidebar = (props) => {
  return (
    <div width={props.width} className="newsletters-sidebar">
      <div
        css={css(`
          padding: 15px 14px;
        `)}
        className="font-bold text-blue-900 text-base leading-4"
      >
        <span className="align-middle">
          {props.user?.firstName} {props.user?.lastName}
        </span>
        <Link
          to={`/settings`}
          css={css(`
            color: inherit;
            &:hover {
              color: inherit;
            }
          `)}
          className="ml-2"
        >
          <SettingsIcon width="24" height="24" className="inline-block" />
        </Link>
      </div>
      {props.publishers && (
        <>
          <Button
            id=""
            name="All"
            active={props.selectedNewsletterId === undefined}
          />
          {props.publishers.map((publisher, i) => {
            return (
              <Button
                {...publisher}
                key={i}
                active={props.selectedNewsletterId === publisher.id}
              />
            );
          })}
          <Button
            id="unknown"
            name="Unknown"
            active={props.selectedNewsletterId === 'unknown'}
          />
        </>
      )}
    </div>
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
