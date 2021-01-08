import React, { useCallback, useEffect } from 'react';
import CloseCircleIcon from 'heroicons/outline/x-circle.svg';
import { DigestList } from './components/digestlist';
import Highlights from './components/highlights';
import Modal from 'react-modal';
import { NewslettersDropdown } from './components/newslettersdropdown';
import { NewslettersSidebar } from './components/newsletterssidebar';
import { PopulateNewslettersStatusBar } from './components/populateNewslettersStatusbar';
import PropTypes from 'prop-types';
import { ViewDigest } from './components/viewdigest';
import { connect } from 'react-redux';
import { css } from '@emotion/react';
import { Actions as NewsletterActions } from '../controllers/newsletters';

const Homepage = (props) => {
  const closeDialog = useCallback(() => {
    props.history.goBack();
  }, [props.history]);

  useEffect(() => {
    props.loadPublishers();
  }, []);

  return (
    <div>
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
      <CloseCircleIcon
        css={css(`
          width: 45px;
          height: 45px;
          position: fixed;
          top: 0px;
          right: 4px;
          z-index: 9999;
          background: white;
          border-radius: 22px;
          cursor: pointer;
          font-size: 40px;
          @media (max-width: 425px) {
            right: 10px;
          }
        `)}
        style={{ display: props.digestId ? 'block' : 'none' }}
        onClick={closeDialog}
      />
      <Modal
        isOpen={!!props.digestId}
        onRequestClose={closeDialog}
        contentLabel="Digest Modal"
        bodyOpenClassName="overflow-hidden"
        css={css(`
          position: absolute;
          top: 0px;
          left: 0px;
          right: 0px;
          bottom: 0px;
          // padding: 20px 0 0 0;
          @media (max-width: 425px) {
            top: 40px;
            padding: 0px;
          }
          border: 1px solid rgb(204, 204, 204);
          background: rgb(255, 255, 255);
          overflow: hidden;
          border-radius: 4px;
          outline: none;
        `)}
      >
        {props.digestId && (
          <ViewDigest
            newsletterId={props.publisher}
            digestId={props.digestId}
          />
        )}
      </Modal>
    </div>
  );
};
Homepage.propTypes = {
  digestId: PropTypes.string,
  publisher: PropTypes.string,
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
const connectedHomepage = connect(
  mapStateToProps,
  mapDispatchToProps
)(Homepage);

export { connectedHomepage as Homepage };
