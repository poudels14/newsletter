import 'antd/dist/antd.css';

import { Divider, Layout } from 'antd';

import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { css } from '@emotion/core';

const Button = ({ classNames, id, name }) => {
  return (
    <Link to={`/nl/${id}`}>
      <div
        className={classNames}
        css={css(`
          padding: 5px 14px;
          margin-bottom: 3px;
          &::before {
            content: "";
            margin-left: 5%;
          };
          &:hover, &.active {
            background: rgba(200, 200, 200, 0.3);
          }
        `)}
      >
        {name}
      </div>
    </Link>
  );
};
Button.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  classNames: PropTypes.string,
};

const NewslettersSidebar = (props) => {
  return (
    <Layout.Sider
      width={props.width}
      css={css({ background: 'white', color: '' })}
    >
      <Divider orientation="left" plain>
        All
      </Divider>
      <Button id="" name="All" classNames={''} />
      {props.publishers &&
        props.publishers.map((publisher, i) => {
          const classNames = classnames({
            active: props.selectedPublisher === publisher.id,
          });
          return <Button {...publisher} key={i} classNames={classNames} />;
        })}
    </Layout.Sider>
  );
};
NewslettersSidebar.propTypes = {
  width: PropTypes.string,
  newsletters: PropTypes.array,

  /** Redux */
  selectedPublisher: PropTypes.string,
  publishers: PropTypes.array,
};

/** Redux */

const mapStateToProps = (state) => {
  const { newsletters } = state;
  return {
    selectedPublisher: newsletters?.selectedPublisher,
    publishers: newsletters?.publishers,
  };
};

const connectedNewslettersSidebar = connect(mapStateToProps)(
  NewslettersSidebar
);

export { connectedNewslettersSidebar as NewslettersSidebar };
