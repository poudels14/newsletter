import 'regenerator-runtime/runtime';
import 'antd/dist/antd.css';

import { App } from './app';
import Modal from 'react-modal';
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(<App />, document.getElementById('the-reading-app'));
Modal.setAppElement('#the-reading-app');
