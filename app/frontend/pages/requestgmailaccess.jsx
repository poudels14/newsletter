import { InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';
import React, { useCallback, useState } from 'react';

import { Link } from 'react-router-dom';
import axios from 'axios';
import { css } from '@emotion/core';
import { requestOfflineAccess } from '../authenticate/gmail';
import SiteWrapper from './sitewrapper';

const RequestGmailAccess = () => {
  const [errorMessage, setErrorMessage] = useState();

  const grantAccess = useCallback(() => {
    setErrorMessage(); // reset error
    requestOfflineAccess()
      .then((user) => {
        if (user) {
          window.location.href = '/';
        } else {
          setErrorMessage('Error signing in! Please refresh the page');
        }
      })
      .catch((err) => {
        console.error(err);
        setErrorMessage('Failed to authorize with Gmail');
      });
  }, []);

  const skipGmailLinking = useCallback(async () => {
    await axios.post('/api/account/updateSettings', {
      settings: { gmailLinkingSkipped: true },
    });
    window.location.href = '/';
  }, []);

  return (
    <SiteWrapper>
      <div
        css={css(`
          font-size: 18px;
          padding: 100px 0 100px 0;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
        `)}
      >
        <div
          css={css(`
          color: rgb(101, 105, 114);
          padding: 10px 0 20px 0;
          line-height: 1.2;
          font-size: 1.6em;
          font-weight: 700;
          text-align: center;
        `)}
        >
          Import newsletters from Gmail
        </div>
        <div
          css={css(`
            flex: 40px 0 0;
            margin: 0 auto;
            padding: 50px 0 50px 0;
            border-radius: 5px;
          `)}
        >
          <div
            css={css(`
              color: red;
              font-size: 16px;
              text-align: center;
              margin-bottom: 20px;
            `)}
          >
            {errorMessage && (
              <>
                <WarningOutlined /> {errorMessage}
              </>
            )}
          </div>
          <div
            onClick={grantAccess}
            css={css(`
              height: 50px;
              width: 240px;
              background: #4285f4;
              border: none;
              color: #fff;
              margin: auto;
              border-radius: 1px;
              box-sizing: border-box;
              box-shadow: 0 2px 4px 0 rgba(0,0,0,.25);
              transition: background-color .218s,border-color .218s,box-shadow .218s;
              cursor: pointer;
              outline: none;
              overflow: hidden;
              text-align: center;
              vertical-align: middle;

              user-select: none;
              margin-bottom: 20px;
              &:hover {
                background-color: #4285f4;
                box-shadow: 0 0 3px 3px rgba(66,133,244,.3);
              }
            `)}
          >
            <div
              css={css(`
                border: 1px solid transparent;
                height: 100%;
                width: 100%;
              `)}
            >
              <div
                css={css(`
                  padding: 15px;
                  background-color: #fff;
                  border-radius: 1px;
                  float: left;
                  line-height: 1;
                `)}
              >
                <div css={css(`width: 18px; height: 18px; `)}>
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="18px"
                    height="18px"
                    viewBox="0 0 48 48"
                  >
                    <g>
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </g>
                  </svg>
                </div>
              </div>
              <span
                css={css(`
                  line-height: 48px;
                  font-size: 16px;
                  font-family: Roboto, arial, sans-serif;
                  font-weight: 500;
                  letter-spacing: .21px;
                  margin-left: 6px;
                  margin-right: 6px;
                  vertical-align: top;
                `)}
              >
                Grant Access to Gmail
              </span>
            </div>
          </div>
          <div
            css={css(`
              font-size: 12px;
              text-align: center;
              margin-bottom: 20px;
            `)}
          >
            <InfoCircleOutlined /> Gmail access is required to import
            newsletters from your email
          </div>
          <div
            css={css(`
              font-size: 14px;
              text-align: center;
              a {
                text-decoration: none;
                color: rgba(100, 100, 100, 0.7);
              }
            `)}
          >
            <Link to="#" onClick={skipGmailLinking}>
              Skip {'>'}
            </Link>
          </div>
        </div>
      </div>
    </SiteWrapper>
  );
};

export default RequestGmailAccess;
