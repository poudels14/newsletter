import React, { useCallback, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { CloseCircleOutlined } from '@ant-design/icons';
import { DigestList } from './components/digestlist';
import Highlights from './components/highlights';
import Modal from 'react-modal';
import { NewslettersDropdown } from './components/newslettersdropdown';
import { NewslettersSidebar } from './components/newsletterssidebar';
import { PopulateNewslettersStatusBar } from './components/populateNewslettersStatusbar';
import PropTypes from 'prop-types';
import { ViewDigest } from './components/viewdigest';
import { connect } from 'react-redux';
import { css } from '@emotion/core';
import { Actions as NewsletterActions } from '../controllers/newsletters';

const Homepage = (props) => {
  const query = new URLSearchParams(props.location.search);
  const digestId = query.get('digestId');

  const closeDialog = useCallback(() => {
    props.history.goBack();
  }, [props.history]);

  useEffect(() => {
    props.loadPublishers();
  }, []);

  return (
    <div className="h-full overflow-y-scroll">
      <div className="homepage flex">
        {!props.deviceType?.mobile && (
          <div
            className="shadow bg-white text-gray-800"
            css={css(`
              width: 250px;
            `)}
          >
            <NewslettersSidebar />
          </div>
        )}
        <div className="flex-1">
          {/* Note(sagar) This will only show in mobile devices */}
          {props.deviceType?.mobile && <NewslettersDropdown />}
          <PopulateNewslettersStatusBar />
          <DigestList />
        </div>

        {props.deviceType?.desktop && (
          <div
            className="shadow bg-white"
            css={css(`
              width: 300px;
            `)}
          >
            <Highlights />
          </div>
        )}
      </div>
      <CloseCircleOutlined
        css={css(`
          position: fixed;
          top: 2px;
          right: 5px;
          z-index: 9999;
          background: white;
          border-radius: 22px;
          cursor: pointer;
          font-size: 40px;
          @media (max-width: 425px) {
            right: 10px;
          }
        `)}
        style={{ display: digestId !== null ? 'block' : 'none' }}
        onClick={closeDialog}
      />
      <Modal
        isOpen={digestId !== null}
        onRequestClose={closeDialog}
        contentLabel="Digest Modal"
        css={css(`
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          bottom: 10px;
          padding: 20px 10px 20px 10px;
          @media (max-width: 425px) {
            top: 40px;
            left: 0px;
            right: 0px;
            bottom: 0px;
            padding: 0px;
          }
          border: 1px solid rgb(204, 204, 204);
          background: rgb(255, 255, 255);
          overflow: hidden;
          border-radius: 4px;
          outline: none;
        `)}
      >
        {digestId && (
          <ViewDigest newsletterId={props.publisher} digestId={digestId} />
        )}
      </Modal>
    </div>
  );
};
Homepage.propTypes = {
  publisher: PropTypes.string,
  /** withRouter props */
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  /** Redux props */
  deviceType: PropTypes.object,
  loadPublishers: PropTypes.func,
};

/** Redux */
const mapStateToProps = (state) => {
  return {
    deviceType: state?.device?.type,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadPublishers: () => dispatch({ type: NewsletterActions.LOAD_PUBLISHERS }),
  };
};
const connectedHomepage = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Homepage)
);

export { connectedHomepage as Homepage };
