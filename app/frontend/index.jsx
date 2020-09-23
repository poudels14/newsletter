import 'regenerator-runtime/runtime';
import 'antd/dist/antd.css';

import React, { Suspense, lazy } from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import Modal from 'react-modal';
import ReactDOM from 'react-dom';

const App = lazy(() => import('./app'));
const Signin = lazy(() => import('./pages/signin'));
const RequestGmailAccess = lazy(() => import('./pages/requestgmailaccess'));
const AdminHomepage = lazy(() => import('./pages/admin/homepage'));
const VerifiedNewsletters = lazy(() => import('./pages/verifiednewsletters'));

const NoMatch = () => {
  return <div>404 Not found</div>;
};

const Pages = () => {
  return (
    <Suspense fallback={<div></div>}>
      <Router>
        <Switch>
          <Route
            path="/signin"
            render={() => {
              return <Signin />;
            }}
          />
          <Route
            path="/grantaccess"
            render={() => {
              return <RequestGmailAccess />;
            }}
          />
          <Route
            path="/supported-newsletters"
            render={() => {
              return <VerifiedNewsletters />;
            }}
          />
          <Route
            path="/admin"
            render={() => {
              return <AdminHomepage />;
            }}
          />
          <Route
            path="/"
            render={() => {
              return <App />;
            }}
          />
          <Route path="*">
            <NoMatch />
          </Route>
        </Switch>
      </Router>
    </Suspense>
  );
};

ReactDOM.render(<Pages />, document.getElementById('the-reading-app'));
Modal.setAppElement('#the-reading-app');
