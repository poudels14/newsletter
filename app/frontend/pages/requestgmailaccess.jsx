import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { css } from '@emotion/core';
import { Button, Message } from 'semantic-ui-react';

import { requestOfflineAccess } from '../authenticate/gmail';

const RequestGmailAccess = (props) => {
  const [errorMessage, setErrorMessage] = useState();

  const grantAccess = useCallback(() => {
    setErrorMessage(); // reset error
    requestOfflineAccess()
      .then((user) => {
        if (user) {
          props.setUser(user);
        } else {
          setErrorMessage('Error signing in! Please refresh the page');
        }
      })
      .catch((err) => {
        console.error(err);
        setErrorMessage('Failed to authorize with Gmail');
      });
  }, []);

  return (
    <div
      css={css({
        width: '100%',
        height: '100%',
        overflow: 'scroll',
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <div
        css={css({
          width: '100%',
          flex: '600px 1 0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
        })}
      >
        <div
          css={css({
            width: '400px',
            flex: '40px 0 0',
            margin: '0 auto',
            padding: '50px 25px 50px 25px',
            borderRadius: '5px',
            border: '1px solid rgba(34,36,38,.15)',
          })}
        >
          {errorMessage && (
            <Message
              icon="warning sign"
              header={errorMessage}
              style={{ color: 'red' }}
            />
          )}
          <Button
            type="button"
            style={{
              width: '350px',
              background: 'rgb(79, 78, 121)',
              color: 'white',
            }}
            size="large"
            onClick={grantAccess}
          >
            Grant access
          </Button>
        </div>
      </div>
    </div>
  );
};
RequestGmailAccess.propTypes = {
  setUser: PropTypes.func.isRequired,
};

export { RequestGmailAccess };
