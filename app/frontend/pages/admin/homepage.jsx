import React, { useMemo, useState } from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import { Layout } from 'antd';
import Newsletters from './newsletters';
import PropTypes from 'prop-types';
import Sidebar from './sidebar';
import Users from './users';
import axios from 'axios';
import { css } from '@emotion/core';

const ContentWrapper = (props) => {
  return (
    <div css={css(`height: 100%;`)}>
      <Layout
        className="admin-homepage"
        css={css(`background: white; min-height: 100%;`)}
      >
        <Sidebar width="250px" pageId={props.pageId} />
        <Layout.Content>{props.children}</Layout.Content>
      </Layout>
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
