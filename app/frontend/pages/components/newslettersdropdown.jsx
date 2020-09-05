import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import { Select } from 'antd';
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

        &:hover, &.active {
          color: inherit;
        }
      `)}
    >
      <div
        className={classNames}
        css={css(`
          padding: 0px 14px;
          border: 0 solid rgba(100, 100, 100, 0.2);
          border-bottom-width: 1px;
          &:hover, &.active {
            color: inherit;
          }
        `)}
      >
        <span>{name}</span>
        {totalUnread !== 0 && (
          <span
            css={css(`
              display: inline-block;
              background: rgb(97, 97, 97);
              padding: 0 10px;
              line-height: 20px;
              border-radius: 2px;
              margin-left: 15px;
              font-size: 12px;

              text-align:center;
              vertical-align: middle;
            `)}
          >
            {totalUnread}
          </span>
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

const NewslettersDropdown = (props) => {
  return (
    <div
      css={css(`
        color: white;
        font-size: 16px;
        display: none;
        @media (max-width: 425px) {
          display: block;
        }
      `)}
    >
      <Select
        defaultValue={props.selectedNewsletterId || 'all'}
        size={'large'}
        bordered={false}
        style={{ width: '100%', color: 'white', background: '#001529' }}
        dropdownStyle={{ color: 'white' }}
      >
        <Select.Option value="all">
          <Button id="" name="All" />
        </Select.Option>
        {props.publishers &&
          props.publishers.map((publisher, i) => {
            return (
              <Select.Option key={i} value={publisher.id}>
                <Button {...publisher} />
              </Select.Option>
            );
          })}
      </Select>
    </div>
  );
};
NewslettersDropdown.propTypes = {
  width: PropTypes.string,
  newsletters: PropTypes.array,

  /** Redux */
  selectedNewsletterId: PropTypes.string,
  publishers: PropTypes.array,
};

/** Redux */

const mapStateToProps = (state) => {
  const { newsletters } = state;
  return {
    selectedNewsletterId: newsletters?.digestFilters?.newsletterId,
    publishers: newsletters?.publishers,
  };
};

const connectedNewslettersDropdown = connect(mapStateToProps)(
  NewslettersDropdown
);

export { connectedNewslettersDropdown as NewslettersDropdown };
