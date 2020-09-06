import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { css } from '@emotion/core';

const PopulateNewslettersStatusBar = (props) => {
  if (props.status?.inProgress !== true) {
    return <></>;
  }
  return (
    <div
      css={css(`
        width: 100%;
        position: absolute;
        left: 0;
        @media (min-width: 425px) {
          top: 0;
        }
        @media (max-width: 425px) {
          bottom: 0;
          font-size: 12px;
        }
      `)}
    >
      <div
        css={css(`
          padding: 0 20px;
          max-width: 800px;
          margin: 0 auto;
        `)}
      >
        <div
          css={css(`
            padding: 5px 0;
            text-align: center;
            background: rgba(70, 176, 70, 0.7);
            color: #fefefe;
            border-radius: 0 0 3px 3px;
            @media (max-width: 425px) {
              padding: 2px 0;
              border-radius: 2px 2px 0 0;
            }
          `)}
        >
          Importing newsletters from Gmail
        </div>
      </div>
    </div>
  );
};
PopulateNewslettersStatusBar.propTypes = {
  status: PropTypes.object,
};

/** Redux */
const mapStateToProps = (state) => {
  const { newsletters } = state;
  return {
    status: newsletters?.populateStatus,
  };
};

const connectedPopulateNewslettersStatusBar = connect(mapStateToProps)(
  PopulateNewslettersStatusBar
);

export { connectedPopulateNewslettersStatusBar as PopulateNewslettersStatusBar };
