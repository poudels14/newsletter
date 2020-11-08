import React, { useMemo, useState } from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import Newsletters from './newsletters';
import PropTypes from 'prop-types';
import RunCommand from './runcommand';
import Sidebar from './sidebar';
import Users from './users';
import axios from 'axios';
import { css } from '@emotion/core';

const ContentWrapper = (props) => {
  return (
    <div className="admin-homepage flex">
      <div css={css(`width: 250px; height: 100vh;`)}>
        <Sidebar pageId={props.pageId} />
      </div>
      <div>{props.children}</div>
    </div>
  );
};
ContentWrapper.propTypes = {
  pageId: PropTypes.string,
  children: PropTypes.object,
};

const Homepage = () => {
  const [admin, setAdmin] = useState(0);
  useMemo(async () => {
    const { data } = await axios.get('/api/account/profile');
    if (data?.isAdmin) {
      setAdmin(2);
    } else {
      setAdmin(1);
    }
  }, []);

  if (admin === 0) {
    return <></>;
  }
  if (admin === 1) {
    return <div>404 Not found</div>;
  }
  return (
    <Router>
      <Switch>
        <Route
          path="/admin/users"
          render={() => {
            return (
              <ContentWrapper pageId={'users'}>
                <Users />
              </ContentWrapper>
            );
          }}
        />
        <Route
          path="/admin/newsletters"
          render={() => {
            return (
              <ContentWrapper pageId={'newsletters'}>
                <Newsletters />
              </ContentWrapper>
            );
          }}
        />
        <Route
          path="/admin/runcommand"
          render={() => {
            return (
              <ContentWrapper pageId={'runcommand'}>
                <RunCommand />
              </ContentWrapper>
            );
          }}
        />
        <Route path="*">
          <ContentWrapper>
            <div>Hey Admin!</div>
          </ContentWrapper>
        </Route>
      </Switch>
    </Router>
  );
};

export default Homepage;
