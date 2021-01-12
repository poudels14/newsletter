import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { LoadingOutlined } from '@ant-design/icons';
import { css } from '@emotion/react';
import { Link } from 'react-router-dom';

import GoBackIcon from 'heroicons/solid/arrow-circle-left.svg';
import CheckIcon from 'heroicons/outline/check-circle.svg';
import useAjax from 'utils/useAjax';
import Icons from './icons';

const ConnectFlow = () => {
  const ajax = useAjax({
    onSuccess: () => {
      window.location = '/integrations';
    },
    onError: (err) => {
      console.log('Error: ', err);
    },
  });

  const [token, setToken] = useState(null);
  const submitToken = () => {
    ajax.post({
      url: '/api/account/setReadwiseToken',
      body: {
        token,
      },
    });
  };

  return (
    <div className="mt-10 space-y-6">
      <div className="space-y-1">
        <h2 className="font-bold text-base underline">Step 1</h2>
        <p>
          Go to{' '}
          <a
            href="https://readwise.io/access_token"
            target="blank"
            className="underline text-blue-800"
          >
            https://readwise.io/access_token
          </a>{' '}
          and generate Readwise access token.
        </p>
      </div>
      <div className="space-y-1">
        <h2 className="font-bold text-base underline">Step 2</h2>
        <p>
          Copy the access token generated from <b>Step 1</b> and paste it below.
        </p>
        <div className="flex flex-col space-y-2">
          {ajax.error && (
            <div className="text-red-500">Something went wrong</div>
          )}
          <input
            onChange={(e) => setToken(e.target.value)}
            type="text"
            placeholder="Access Token"
            className="rounded"
          />
          <button
            type="submit"
            className="py-2 px-5 max-w-max flex space-x-2 text-white rounded border border-blue-600 bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 disabled:opacity-50"
            disabled={!token || ajax.inProgress}
            onClick={submitToken}
          >
            {ajax.inProgress && (
              <div className="animate-spin">
                <LoadingOutlined />
              </div>
            )}
            <div>Submit</div>
          </button>
        </div>
      </div>
    </div>
  );
};

const ConnectedInfo = () => {
  return (
    <div className="mt-3 space-y-6">
      <div className="flex space-x-3">
        <h2 className="m-0 font-bold text-lg">Readwise is already connected</h2>
        <div className="text-green-500 flex flex-col justify-around">
          <CheckIcon width="24px" />
        </div>
      </div>

      {/* <div className="space-y-2">
        <div>Click Disconnect to unlink Readwise</div>
        <button type="submit" className="py-1 px-5 rounded border border-red-600 bg-red-500 text-white">Disconnect</button>
      </div> */}
    </div>
  );
};

const Readwise = (props) => {
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
        <Link to="/integrations">
          <GoBackIcon width="24px" className="inline" />
          <span className="align-middle font-bold"> Go back</span>
        </Link>
      </div>
      <div className="p-2">
        <div className="space-y-2">
          <div className="flex flex-row space-x-3">
            <div className="w-8">
              <Icons.readwise />
            </div>
            <h2 className="m-0 font-bold text-xl flex-1">Readwise</h2>
          </div>
          <p>
            Readwise makes it easy to revisit and learn from your ebook &
            article highlights.
          </p>
          <p>
            Once Readwise is connected, all your current and future highlights
            in Alpine Reader will be sent to Readwise.
          </p>
        </div>
        {props.connected ? <ConnectedInfo /> : <ConnectFlow />}
      </div>
    </div>
  );
};
Readwise.propTypes = {
  connected: PropTypes.bool,
};

export default Readwise;
