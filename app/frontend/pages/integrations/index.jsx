import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Link } from 'react-router-dom';
import { css } from '@emotion/react';
import classnames from 'classnames';
import axios from 'axios';

import GoBackIcon from 'heroicons/solid/arrow-circle-left.svg';

import Readwise from './readwise';
import Gmail from './gmail';
import Icons from './icons';

const Connector = (props) => {
  const Icon = Icons[props.icon];
  return (
    <div className="w-60 p-3 m-2 flex flex-col space-y-4 rounded border border-gray-400">
      <div className="flex flex-row space-x-3">
        <div className="w-8">
          <Icon />
        </div>
        <h2 className="m-0 font-bold text-xl flex-1">{props.title}</h2>
      </div>
      <div className="flex-1 text-xs text-gray-600">{props.description}</div>
      <div className="space-x-2">
        <Link to={`/integrations/${props.id}`}>
          <button
            className={classnames(
              'btn px-2 font-bold rounded border border-green-500',
              {
                'text-gray-100 bg-green-500': props.connected,
                'text-green-800': !props.connected,
              }
            )}
          >
            {props.connected ? 'Manage' : 'Connect'}
          </button>
        </Link>
      </div>
    </div>
  );
};
Connector.propTypes = {
  id: PropTypes.string,
  icon: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  connected: PropTypes.bool,
};

const MainPage = (props) => {
  return (
    <div>
      <div
        css={css(`
          margin-bottom: 10px;
          a {
            color: inherit;
          }
        `)}
      >
        <Link to="/settings">
          <GoBackIcon width="24px" className="inline" />
          <span className="align-middle font-bold"> Go back</span>
        </Link>
      </div>
      <div className="m-2 font-bold text-lg">Integrations</div>
      <div className="w-full flex flex-row flex-wrap">
        {props.integrations.map((connector, i) => (
          <Connector key={i} {...connector} />
        ))}
      </div>
    </div>
  );
};
MainPage.propTypes = {
  integrations: PropTypes.array,
};

const Integrations = () => {
  const [integrations, setIntegrations] = useState();
  useMemo(async () => {
    const { data } = await axios.get('/api/account/integrations');
    setIntegrations(data);
  }, []);

  if (!integrations) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="integrations h-screen text-gray-700"
      css={css(`
        min-height: 100%;
        background: white;
        display: flex;
      `)}
    >
      <div
        className="shadow"
        css={css(`
          font-size: 14px;
          flex: 1 1 300px;
          max-width: 800px;
          margin: 0 auto;
          padding: 15px 15px;
        `)}
      >
        <Switch>
          <Route
            path="/integrations/readwise"
            render={() => <Readwise {...integrations.readwise} />}
          />
          <Route
            path="/integrations/gmail"
            render={() => <Gmail {...integrations.gmail} />}
          />
          <Route
            path="/integrations"
            render={() => (
              <MainPage integrations={Object.values(integrations)} />
            )}
          />
        </Switch>
      </div>
    </div>
  );
};

export default Integrations;
