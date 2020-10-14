import React from 'react';
import { css } from '@emotion/core';

const SiteWrapper = (props) => {
  return (
    <div>
      <div
        css={css(`
        display: block;
        padding: 15px;
        background: linear-gradient(45deg, #152649 0%, #243055 100%);
        opacity: 0.9;
      `)}
      >
        <div className="header-nav">
          <a
            href="https://www.alpinereader.com/"
            className="logo w-inline-block"
          >
            <img
              src="assets/images/logo_white.png"
              width="200"
              alt="Alpine logo"
            />
          </a>
        </div>
      </div>
      <div className="wrapper">{props.children}</div>
      <div
        css={css(`
          position: relative;
          overflow: visible;
          padding: 140px 20px 40px;
          background-image: linear-gradient(45deg, #152649 0%, #243055 100%);
          opacity: 0.9;
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
              <h4
                css={css(`
                  margin-top: 0px;
                  margin-bottom: 30px;
                  color: #dbe4f1;
                  font-size: 14px;
                  line-height: 14px;
                  font-weight: 400;
                `)}
              >
                Alpine
              </h4>
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
                className="footer-info-link"
              >
                Privacy Policy
              </a>
              <a
                href="https://www.alpinereader.com/tos.html"
                target="_blank"
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

export default SiteWrapper;
