import React, { useCallback, useState } from 'react';

import { WarningOutlined } from '@ant-design/icons';
import { css } from '@emotion/core';
import { signIn as googleSignIn } from '../authenticate/gmail';

const Signin = () => {
  const [errorMessage, setErrorMessage] = useState();

  const signIn = useCallback(() => {
    setErrorMessage(); // reset error

    googleSignIn()
      .then(() => {
        window.location.href = '/';
      })
      .catch((err) => {
        console.error(err);
        setErrorMessage('Sign in failed. Please try again!');
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
          css={css(`
            width: 400px;
            flex: 40px 0 0;
            margin: 0 auto;
            padding: 50px 25px 50px 25px;
            border-radius: 5px;
            border: 1px solid rgba(34,36,38,.15);
          `)}
        >
          {errorMessage && (
            <div
              css={css(`
                color: red;
                font-size: 16px;
                text-align: center;
                margin-bottom: 20px;
              `)}
            >
              <WarningOutlined /> {errorMessage}
            </div>
          )}
          <div
            onClick={signIn}
            className="abcRioButtonContentWrapper"
            css={css(`
              border: 1px solid #4285f4;
              height: 50px;
              width: 350px;
              font-size: 16px;
              cursor: pointer;
              user-select: none;
              background: #4285f4;
              color: #fff;
              text-align: center;
              box-shadow: 0 0 4px 0 rgba(0,0,0,.25);
              transition: background-color .218s,border-color .218s,box-shadow .218s;
              &:hover {
                box-shadow: 0 0 4px 0 #4285f4;
              }
            `)}
          >
            <div css={css(`background: #fff; padding: 15px; float: left;`)}>
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
            <span css={css(`line-height: 48px; `)}>Sign in with Google</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
