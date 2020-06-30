import { css } from '@emotion/core';
import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';

const DigestList = () => {
  const [state, setState] = useState({});

  useMemo(async () => {
    const { data } = await axios.get('/api/newsletters/listDigests');
    setState({ newsletters: data });
  }, []);

  return (
    <div>
      <div>
        {state.newsletters &&
          Object.keys(state.newsletters).map((newsletterId) => {
            console.log(newsletterId);
            const newsletter = state.newsletters[newsletterId];
            return (
              <div key={newsletterId}>
                <div>
                  {newsletter.name} by {newsletter.authorName}
                </div>
                <div>
                  {newsletter.digests &&
                    newsletter.digests.map((digest) => {
                      return (
                        <div
                          key={digest.id}
                          css={css({ padding: '10px 30px' })}
                        >
                          <a href={`/nl/${digest.contentUrl}`}>
                            {digest.title}
                          </a>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

const PrivatePages = () => {
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

const Homepage = (props) => {
  return (
    <>
      <PrivatePages />
    </>
  );
};

export { Homepage };
