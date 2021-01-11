import React from 'react';

import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import SettingsIcon from 'heroicons/outline/cog.svg';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { css } from '@emotion/react';
import DownArrorIcon from 'heroicons/outline/chevron-down.svg';
import RightArrowIcon from 'heroicons/outline/chevron-right.svg';
import toggleState from 'utils/toggleState';

const sortPublisherByName = (a, b) => {
  var nameA = a.name?.toLowerCase();
  var nameB = b.name?.toLowerCase();
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
};

const TabButton = ({ id, name, authorEmail, totalUnread, active }) => {
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
          'tab-menu-item hover:bg-gray-100 border-t border-gray-100',
          {
            'active text-gray-900 bg-gray-200': active,
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
            className="bg-gray-100 px-1 rounded-sm ml-3 inline-block text-center align-middle"
          >
            {totalUnread}
          </div>
        )}
      </div>
    </Link>
  );
};
TabButton.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  authorEmail: PropTypes.string,
  totalUnread: PropTypes.number,
  active: PropTypes.bool,
};

const HiddenPublishers = (props) => {
  const publishers = props.publishers
    .map((publisherId) => props.publishersById[publisherId])
    .sort(sortPublisherByName);
  const [expanded, toggleExpanded] = toggleState(false);
  const HiddenIcon = expanded ? DownArrorIcon : RightArrowIcon;
  return (
    <div>
      <div
        className={'cursor-default select-none font-bold space-x-1'}
        css={css(`
          padding: 5px 14px;
        `)}
        onClick={toggleExpanded}
      >
        <HiddenIcon width="16" height="16" className="inline" />
        <span>Hidden Newsletters</span>
      </div>
      {expanded && (
        <div className="border-b border-gray-100">
          {publishers.map((publisher, i) => {
            return (
              <TabButton
                {...publisher}
                key={i}
                active={props.selectedNewsletterId === publisher.id}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
HiddenPublishers.propTypes = {
  selectedNewsletterId: PropTypes.string,
  publishers: PropTypes.array,
  publishersById: PropTypes.object,
};

const NewslettersSidebar = (props) => {
  const hiddenPublishers = new Set(props.hiddenPublishers);
  const visiblePublishers = props.publishers
    ?.filter((p) => !hiddenPublishers.has(p.id))
    .sort(sortPublisherByName);
  return (
    <div width={props.width} className="newsletters-sidebar space-y-5 pb-20">
      <div
        css={css(`
          padding: 15px 14px 0 14px;
        `)}
        className="font-bold text-blueGray-800 text-base leading-4"
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
        <div className="border-b border-gray-100">
          <TabButton
            id=""
            name="All"
            active={props.selectedNewsletterId === undefined}
          />
          {visiblePublishers.map((publisher, i) => {
            return (
              <TabButton
                {...publisher}
                key={i}
                active={props.selectedNewsletterId === publisher.id}
              />
            );
          })}
          <TabButton
            id="unknown"
            name="Un-recognized"
            active={props.selectedNewsletterId === 'unknown'}
          />
        </div>
      )}
      <HiddenPublishers
        selectedNewsletterId={props.selectedNewsletterId}
        publishers={props.hiddenPublishers}
        publishersById={props.publishersById}
      />
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
  publishersById: PropTypes.object,
  hiddenPublishers: PropTypes.array,
};

/** Redux */

const mapStateToProps = (state) => {
  const { account, newsletters } = state;
  return {
    user: account?.user,
    selectedNewsletterId: newsletters?.digestFilters?.newsletterId,
    publishers: newsletters?.publishers,
    publishersById: newsletters?.publishersById || {},
    hiddenPublishers: newsletters.hiddenPublishers || [],
  };
};

const connectedNewslettersSidebar = connect(mapStateToProps)(
  NewslettersSidebar
);

export { connectedNewslettersSidebar as NewslettersSidebar };
