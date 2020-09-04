import { Layout } from 'antd';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { css } from '@emotion/core';
import { format as formatDate } from 'date-fns';

const HighlightsSidebar = ({ highlights, ...props }) => {
  return (
    <Layout.Sider
      width={props.width}
      css={css(`
        background: white;
        border: 0px solid rgba(11, 147, 92, 1);
        border-left-width: 1px;
        font-size: 16px;
        @media (max-width: 1020px) {
          display: none;
        }
      `)}
    >
      <div
        css={css(`
          background: rgba(11, 147, 92, 1);
          color: white;
          padding: 15px 14px;
          font-size: 18px;
          font-weight: 700;
          text-align: center;
        `)}
      >
        <span>Highlights</span>
      </div>

      <div
        css={css(`
          background: white;
        `)}
      >
        {(highlights === null || highlights?.length === 0) && (
          <div
            css={css(`padding: 10px 20px; width: 100%; text-align: center;`)}
          >
            {highlights === null ? 'Loading...' : 'No highlighted texts yet!'}
          </div>
        )}
        {highlights &&
          highlights.map((highlight, i) => {
            return (
              <div
                key={i}
                css={css(`
                padding: 10px 10px;
              `)}
              >
                <div
                  css={css(`
                  font-size: 12px;
                  color: gray;
                `)}
                >
                  {formatDate(new Date(highlight.date), 'LLL dd, yyyy')}
                </div>
                <div
                  css={css(`
                  font-size: 14px;
                  font-weight: 600;
                `)}
                >
                  <Link
                    key={highlight.id}
                    to={`/nl/${highlight.newsletterId}/?digestId=${highlight.digestId}#${highlight.id}`}
                    css={css(`color: inherit;`)}
                  >
                    {highlight.content}
                  </Link>
                </div>
                <div
                  css={css(`
                  font-size: 12px;
                  padding: 0 0 0 10px;
                `)}
                >
                  - {highlight.title}
                </div>
              </div>
            );
          })}
      </div>
    </Layout.Sider>
  );
};
HighlightsSidebar.propTypes = {
  width: PropTypes.string,
  /** Redux */
  highlights: PropTypes.array,
};

/** Redux */

const mapStateToProps = (state) => {
  const { newsletters } = state;
  return {
    highlights: newsletters?.highlights,
  };
};

const connectedHighlightsSidebar = connect(mapStateToProps)(HighlightsSidebar);

export { connectedHighlightsSidebar as HighlightsSidebar };
