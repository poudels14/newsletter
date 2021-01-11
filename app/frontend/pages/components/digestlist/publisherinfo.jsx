import React from 'react';

import { Actions as NewslettersActions } from '../../../controllers/newsletters';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { css } from '@emotion/react';
import Switch from 'ui/Switch';

const PublisherInfo = ({ publisher, hiddenFromSidebar, ...props }) => {
  const toggleHideFromSidebar = () => {
    if (hiddenFromSidebar) {
      props.showInSidebar(publisher.id);
    } else {
      props.hideFromSidebar(publisher.id);
    }
  };
  return (
    <div
      css={css(`
        padding: 10px 20px;
      `)}
    >
      <div
        css={css(`
          font-size: 18px;
          font-weight: 700;
        `)}
      >
        {publisher.authorName}
      </div>
      <div
        css={css(`
          font-size: 15px;
        `)}
      >
        {publisher.authorEmail}
      </div>
      <div className="space-x-1">
        <div className="inline">Hide from sidebar</div>
        <Switch
          checked={hiddenFromSidebar}
          toggle={toggleHideFromSidebar}
          checkedClassName="bg-gray-600"
          unCheckedClassName="border-gray-500"
          checkedKnobClassName="bg-white"
          unCheckedKnobClassName="bg-gray-500"
        />
      </div>
    </div>
  );
};
PublisherInfo.propTypes = {
  publisher: PropTypes.object,
  /** Redux props */
  hiddenFromSidebar: PropTypes.bool,
  hideFromSidebar: PropTypes.func,
  showInSidebar: PropTypes.func,
};

/** Redux */
const mapStateToProps = (state, ownProps) => {
  const { newsletters } = state;
  return {
    hiddenFromSidebar: newsletters?.hiddenPublishers?.includes(
      ownProps.publisher?.id
    ),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    hideFromSidebar: (publisherId) =>
      dispatch({ type: NewslettersActions.HIDE_FROM_SIDEBAR, publisherId }),
    showInSidebar: (publisherId) =>
      dispatch({ type: NewslettersActions.SHOW_IN_SIDEBAR, publisherId }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PublisherInfo);
