import React from 'react';
import { css } from '@emotion/react';
import PropTypes from 'prop-types';

const SiteWrapper = (props) => {
  return (
    <div>
      <div
        css={css(`
        display: block;
        padding: 15px;
        opacity: 0.9;
      `)}
      >
        <div className="header-nav">
          <a
            href="https://www.alpinereader.com/"
            className="logo w-inline-block"
            css={css(`
              color: var(--logo-fill-color);
              text-decoration: none;
              :hover {
                color: var(--logo-fill-color);
              }
            `)}
          >
            <img
              src="assets/logos/logo-light.png"
              width="50px"
              alt="Alpine logo"
              css={css(`
                vertical-align: middle;
                float: left;
                margin-right: 10px;
              `)}
            />
            <div
              css={css(`
                font-size: 32px;
                font-weight: 800;
                line-height: 50px;
              `)}
            >
              Alpine
            </div>
          </a>
        </div>
      </div>
      <div className="wrapper">{props.children}</div>
      <div
        css={css(`
          position: relative;
          overflow: visible;
          padding: 100px 20px 40px;
          background-image: linear-gradient(45deg, var(--footer-color-start) 0%, var(--footer-color-end) 100%);
        `)}
      >
        <div
          css={css(`
            max-width: 1140px;
            margin-right: auto;
            margin-left: auto;

            .footer-link {
              display: block;
              margin-bottom: 18px;
              -webkit-transition: all 250ms ease-in;
              transition: all 250ms ease-in;
              color: #f8fbfe;
              font-size: 16px;
              text-decoration: none;
            }
            
            .footer-link:hover {
              margin-left: 4px;
              color: #50e3c2;
            }
          `)}
        >
          <div className="w-layout-grid grid">
            <div className="footer-col">
              <a
                href="https://www.alpinereader.com/#features"
                className="footer-link"
              >
                Features
              </a>
              <a
                href="https://www.alpinereader.com/#faqs"
                className="footer-link"
              >
                F.A.Q
              </a>
              <a
                href="https://www.alpinereader.com/#linking-gmail"
                className="footer-link"
              >
                Google API Services usage disclosure
              </a>
            </div>
          </div>
          <div
            css={css(`
              position: relative;
              z-index: 2;
              display: -webkit-box;
              display: -webkit-flex;
              display: -ms-flexbox;
              display: flex;
              margin-top: 60px;
              -webkit-box-pack: justify;
              -webkit-justify-content: space-between;
              -ms-flex-pack: justify;
              justify-content: space-between;
              -webkit-box-align: center;
              -webkit-align-items: center;
              -ms-flex-align: center;
              align-items: center;

              .footer-info-text {
                margin-top: 0px;
                margin-bottom: 0px;
                color: #dbe4f1;
                font-size: 12px;
                line-height: 18px;
              }

              .footer-info-links {
                position: relative;
                display: -webkit-box;
                display: -webkit-flex;
                display: -ms-flexbox;
                display: flex;
              }

              .footer-info-link {
                margin-right: 10px;
                margin-left: 10px;
                -webkit-transition: color 250ms ease-in;
                transition: color 250ms ease-in;
                color: #dbe4f1;
                font-size: 12px;
                text-decoration: none;
              }
        
              .footer-info-link:hover {
                color: #50e3c2;
              }
            `)}
          >
            <p className="footer-info-text">
              © 2020 Alpine. All rights reserved
            </p>
            <div className="footer-info-links">
              <a
                href="https://www.alpinereader.com/privacy.html"
                target="_blank"
                rel="noreferrer"
                className="footer-info-link"
              >
                Privacy Policy
              </a>
              <a
                href="https://www.alpinereader.com/tos.html"
                target="_blank"
                rel="noreferrer"
                className="footer-info-link"
              >
                Terms &amp; Conditions
                <br />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
SiteWrapper.propTypes = {
  children: PropTypes.object,
};

export default SiteWrapper;
