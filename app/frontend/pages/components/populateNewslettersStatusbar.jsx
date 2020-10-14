import React, { useEffect } from 'react';

import { Actions } from '../../controllers/newsletters';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { css } from '@emotion/core';

const PopulateNewslettersStatusBar = (props) => {
  const gmailLinkingSkipped = props.user?.settings?.gmailLinkingSkipped;
  let message = 'Importing newsletters from Gmail';
  if (gmailLinkingSkipped) {
    message = 'Link Gmail to import newsletters from your email';
  }
  useEffect(() => {
    if (!gmailLinkingSkipped) {
      props.populate();
    }
  }, []);
  if (!gmailLinkingSkipped && props.status?.inProgress != true) {
    return <></>;
  }
  return (
    <div
      css={css(`
        font-size: 14px;
        @media (max-width: 425px) {
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
          {message}
        </div>
      </div>
    </div>
  );
};
PopulateNewslettersStatusBar.propTypes = {
  user: PropTypes.object,
  status: PropTypes.object,
  /** Redux props */
  populate: PropTypes.func.isRequired,
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
  return {
    populate: () => dispatch({ type: Actions.POPULATE }),
  };
};

const connectedPopulateNewslettersStatusBar = connect(
  mapStateToProps,
  mapDispatchToProps
)(PopulateNewslettersStatusBar);

export { connectedPopulateNewslettersStatusBar as PopulateNewslettersStatusBar };
