import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { css } from '@emotion/react';
import { format as formatDate } from 'date-fns';

const Highlights = ({ highlights }) => {
  return (
    <div className="highlights">
      <div
        css={css(`
          background: var(--title-background-color);
          color: var(--title-text-color);
          padding: 15px 14px;
          font-size: 18px;
          font-weight: 700;
          text-align: center;
        `)}
      >
        <span>Highlights</span>
      </div>

      <div className="bg-white">
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
                    to={`/nl/${highlight.newsletterId}/?digestId=${highlight.digestId}#${highlight.id}`}
                    css={css(`
                      color: var(--highlighted-text-color);
                    `)}
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
    </div>
  );
};
Highlights.propTypes = {
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

const connectedHighlights = connect(mapStateToProps)(Highlights);

export default connectedHighlights;
