import { Divider, Layout } from 'antd';
import React, { useEffect } from 'react';

import { Actions } from '../controllers/newsletters';
import { DigestList } from './components/digestlist';
import { NavigationHeader } from './components/navigationheader';
import { NewslettersSidebar } from './components/newsletterssidebar';
import PropTypes from 'prop-types';
import { Sidebar } from './components/sidebar';
import { connect } from 'react-redux';

const Homepage = (props) => {
  useEffect(() => {
    props.loadPublishers();
  }, []);
  useEffect(() => {
    props.selectPublisher(props.selectedPublisher);
  }, [props.selectedPublisher]);

  return (
    <div>
      <NavigationHeader />
      <Layout className="site-layout2" style={{ background: 'white' }}>
        <NewslettersSidebar width="250px" />
        <Divider type="vertical" style={{ height: '100%' }} />
        <Layout.Content style={{ margin: '0 16px' }}>
          <DigestList />
        </Layout.Content>
        <Sidebar width="300px" />
      </Layout>
    </div>
  );
};
Homepage.propTypes = {
  selectedPublisher: PropTypes.string,
  /** Redux props */
  loadPublishers: PropTypes.func.isRequired,
  selectPublisher: PropTypes.func.isRequired,
};

/** Redux */

const mapDispatchToProps = (dispatch) => {
  return {
    loadPublishers: () => dispatch({ type: Actions.LOAD_PUBLISHERS }),
    selectPublisher: (publisher) =>
      dispatch({ type: Actions.SELECT_PUBLISHER, publisher }),
  };
};

const connectedHomepage = connect(null, mapDispatchToProps)(Homepage);

export { connectedHomepage as Homepage };
