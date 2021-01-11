import React, { useMemo, useState } from 'react';

import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { css } from '@emotion/react';
import { format as formatDate } from 'date-fns';
import Fuse from 'fuse.js';

const HighlightList = ({ searchQuery, highlights }) => {
  if (searchQuery.length > 0 && highlights.length == 0) {
    return <div css={css(`padding: 10px 10px;`)}>No match found</div>;
  }
  return (
    <>
      {highlights.map((highlight, i) => {
        return (
          <div
            key={i}
            className="hover:bg-gray-100"
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
              {formatDate(highlight.date, 'LLL dd, yyyy')}
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
    </>
  );
};
HighlightList.propTypes = {
  searchQuery: PropTypes.string,
  highlights: PropTypes.array,
};

const HIGHLIGHT_SEARCH_OPTIONS = {
  findAllMatches: true,
  ignoreLocation: true,
  useExtendedSearch: true,
  keys: ['title', 'content'],
};

const Highlights = ({ highlights }) => {
  const [searchText, setSearchText] = useState('');

  const filteredHighlights = useMemo(() => {
    if (searchText.trim().length == 0) {
      return highlights;
    }
    const searchQuery = searchText
      .split(/\s+/)
      .reduce((agg, q) => "'" + q + ' ' + agg, '');
    const fuse = new Fuse(highlights || [], HIGHLIGHT_SEARCH_OPTIONS);
    return fuse.search(searchQuery).map((r) => r.item);
  }, [highlights, searchText]);

  return (
    <div className="highlights h-screen custom-scrollbar">
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

      <div className="w-full flex max-w-screen-md m-auto">
        <input
          placeholder="Search"
          className="flex-1 p-2 m-2 rounded focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className="bg-white pb-5 max-w-screen-md m-auto">
        {(highlights === null || highlights?.length === 0) && (
          <div
            css={css(`padding: 10px 20px; width: 100%; text-align: center;`)}
          >
            {highlights === null ? 'Loading...' : 'No highlighted texts yet!'}
          </div>
        )}
        {highlights && (
          <HighlightList
            highlights={filteredHighlights}
            searchQuery={searchText}
          />
        )}
        {/* //TODO(sagar): implement load more; max 100 highlights are being loaded right now */}
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
