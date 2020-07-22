import { Divider, Layout } from 'antd';
import React, { useCallback, useEffect } from 'react';

import { Actions } from '../controllers/newsletters';
import { DigestList } from './components/digestlist';
import Modal from 'react-modal';
import { NavigationHeader } from './components/navigationheader';
import { NewslettersSidebar } from './components/newsletterssidebar';
import PropTypes from 'prop-types';
// import { Sidebar } from './components/sidebar';
import { ViewDigest } from './components/viewdigest';
import { connect } from 'react-redux';
import { css } from '@emotion/core';

const Homepage = (props) => {
  console.log('rendering homepage');
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
    <div>
      <NavigationHeader />
      <Layout className="site-layout2" style={{ background: 'white' }}>
        <NewslettersSidebar width="250px" />
        <Divider type="vertical" style={{ height: '100%' }} />
        <Layout.Content>
          <DigestList
            style={{ padding: '0px 20px', maxWidth: '800px', margin: '0 auto' }}
          />
        </Layout.Content>
        {/* <Sidebar width="300px" /> */}
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
            border: 1px solid rgb(204, 204, 204);
            background: rgb(255, 255, 255);
            overflow: hidden;
            border-radius: 4px;
            outline: none;
            padding: 20px;
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
