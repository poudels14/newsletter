import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import Modal from 'react-modal';
import { Loader } from 'semantic-ui-react';

const run = async () => {
  await axios.get('/api/newsletters/populate');
};

const Dialog = (props) => {
  return (
    <Modal
      isOpen={props.visible}
      style={{
        content: {
          width: '500px',
          height: '200px',
          margin: 'auto',
        },
      }}
      contentLabel="Loading newsletters from email..."
      shouldCloseOnOverlayClick={true}
    >
      <Loader active size="huge" style={{}}>
        Loading newsletters from your email
      </Loader>
    </Modal>
  );
};
Dialog.propTypes = {
  visible: PropTypes.bool.isRequire,
};

export const PopulateNewsletters = {
  run,
  Dialog,
};
