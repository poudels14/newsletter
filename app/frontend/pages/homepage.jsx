import React, { useCallback, useEffect } from 'react';

import { Actions } from '../controllers/newsletters';
import { CloseCircleOutlined } from '@ant-design/icons';
import { DigestList } from './components/digestlist';
import { HighlightsSidebar } from './components/highlightssidebar';
import { Layout } from 'antd';
import Modal from 'react-modal';
import { NewslettersDropdown } from './components/newslettersdropdown';
import { NewslettersSidebar } from './components/newsletterssidebar';
import { PopulateNewslettersStatusBar } from './components/populateNewslettersStatusbar';
import PropTypes from 'prop-types';
import { ViewDigest } from './components/viewdigest';
import { connect } from 'react-redux';
import { css } from '@emotion/core';

const Homepage = (props) => {
  useEffect(() => {
    props.selectPublisher(props.publisher);
  }, [props.publisher]);
  const closeDialog = useCallback(() => {
    props.history.push(props.history.location.pathname);
  }, [props.history.push]);

  return (
    <div css={css(`height: 100%;`)}>
      <Layout
        className="homepage"
        css={css(`background: white; min-height: 100%;`)}
      >
        <NewslettersSidebar width="250px" />
        <Layout.Content>
          {/* Note(sagar) This will only show in mobile devices */}
          <NewslettersDropdown />
          <PopulateNewslettersStatusBar />
          <DigestList />
        </Layout.Content>
        <HighlightsSidebar width="350px" />
      </Layout>
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
        style={{ display: props.digestId !== null ? 'block' : 'none' }}
        onClick={closeDialog}
      />
      <Modal
        isOpen={props.digestId !== null}
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
  history: PropTypes.object,
  publisher: PropTypes.string,
  digestId: PropTypes.string,
  /** Redux props */
  selectPublisher: PropTypes.func.isRequired,
};

/** Redux */

const mapDispatchToProps = (dispatch) => {
  return {
    selectPublisher: (newsletterId) =>
      dispatch({
        type: Actions.UPDATE_DIGEST_FILTERS,
        filters: { newsletterId },
      }),
  };
};

const connectedHomepage = connect(null, mapDispatchToProps)(Homepage);

export { connectedHomepage as Homepage };
