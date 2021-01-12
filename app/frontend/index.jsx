import 'regenerator-runtime/runtime';

import React, { Suspense, lazy } from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import Modal from 'react-modal';
import ReactDOM from 'react-dom';

import './style.css';
const App = lazy(() => import('./app'));
const Integrations = lazy(() => import('./pages/integrations'));
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
            path="/grantaccess"
            render={() => {
              return <RequestGmailAccess />;
            }}
          />
          <Route
            path="/integrations"
            render={() => {
              return <Integrations />;
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
