import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';

import { App } from './app';

ReactDOM.render(<App />, document.getElementById('the-reading-app'));
Modal.setAppElement('#the-reading-app');
