import React, { useCallback, useEffect } from 'react';

import { Actions } from '../controllers/newsletters';
import { DigestList } from './components/digestlist';
import { HighlightsSidebar } from './components/highlightssidebar';
import { Layout } from 'antd';
import Modal from 'react-modal';
import { NewslettersSidebar } from './components/newsletterssidebar';
import { PopulateNewslettersStatusBar } from './components/populateNewslettersStatusbar';
import PropTypes from 'prop-types';
import { ViewDigest } from './components/viewdigest';
import { connect } from 'react-redux';
import { css } from '@emotion/core';

const Homepage = (props) => {
  useEffect(() => {
    props.populate();
    props.loadPublishers();
  }, []);
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
          <PopulateNewslettersStatusBar />
          <DigestList
            css={css(`
              padding: 50px 20px;
              max-width: 800px;
              margin: 0 auto;
            `)}
          />
        </Layout.Content>
        <HighlightsSidebar width="350px" />
      </Layout>
      <Modal
        isOpen={props.digestId !== null}
        onRequestClose={closeDialog}
        contentLabel="Digest Modal"
        css={css(`
          position: absolute;
          top: 40px;
          left: 40px;
          right: 40px;
          bottom: 40px;
          padding: 20px;
          @media (max-width: 425px) {
            top: 20px;
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
  populate: PropTypes.func.isRequired,
  loadPublishers: PropTypes.func.isRequired,
  selectPublisher: PropTypes.func.isRequired,
};

/** Redux */

const mapDispatchToProps = (dispatch) => {
  return {
    populate: () => dispatch({ type: Actions.POPULATE }),
    loadPublishers: () => dispatch({ type: Actions.LOAD_PUBLISHERS }),
    selectPublisher: (publisher) =>
      dispatch({ type: Actions.SELECT_PUBLISHER, publisher }),
  };
};

const connectedHomepage = connect(null, mapDispatchToProps)(Homepage);

export { connectedHomepage as Homepage };
