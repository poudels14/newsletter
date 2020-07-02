import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { DigestList } from './digestlist';

const Homepage = () => {
  return (
    <Router>
      <Switch>
        <Route
          path="/"
          exact
          render={() => {
            return <DigestList />;
          }}
        />
      </Switch>
    </Router>
  );
};

export { Homepage };
