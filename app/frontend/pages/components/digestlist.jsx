import React, { useCallback, useMemo } from 'react';

import { Link } from 'react-router-dom';
import { Actions as NewslettersActions } from '../../controllers/newsletters';
import PropTypes from 'prop-types';
import { Switch } from 'antd';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { css } from '@emotion/core';
import { format as formatDate } from 'date-fns';

const DigestList = (props) => {
  const selectedNewsletter = useMemo(() => {
    return props.newsletters?.filter(
      (n) => n.id == props.digestFilters?.newsletterId
    )[0];
  }, [props.newsletters, props.digestFilters?.newsletterId]);

  const toggleUnreadOnly = useCallback(
    (checked) => {
      props.updateDigestFilters({ unreadOnly: checked });
    },
    [props.updateDigestFilters]
  );

  const shouldShowLoadMore = useMemo(() => {
    const totalViewableDigest = props.digestFilters?.unreadOnly
      ? selectedNewsletter?.totalUnread
      : selectedNewsletter?.totalDigests;
    return (
      props.digests &&
      props.digests.length > 0 &&
      (!selectedNewsletter || props.digests.length < totalViewableDigest)
    );
  }, [props.digests, selectedNewsletter]);

  return (
    <div
      css={css(`
        max-width: 800px;
        margin: 10px auto;
      `)}
      className="digest-list"
    >
      <div
        css={css(`
          padding: 10px 20px;
          margin-top: 30px;
          @media (max-width: 425px) {
            right: 10px;
            margin-top: 50px;
          }
        `)}
      >
        <Switch
          defaultChecked={props.digestFilters?.unreadOnly}
          checkedChildren="Unread Only"
          unCheckedChildren="All"
          css={css(`background-color: #2c3a61`)}
          onChange={toggleUnreadOnly}
        />
      </div>
      {selectedNewsletter && (
        <div
          css={css(`
            padding: 10px 20px;
          `)}
        >
          <div
            css={css(`
              font-size: 18px;
              font-weight: 700;
            `)}
          >
            {selectedNewsletter.authorName}
          </div>
          <div
            css={css(`
              font-size: 15px;
            `)}
          >
            {selectedNewsletter.authorEmail}
          </div>
        </div>
      )}
      <div
        css={css(`
          padding: 10px 10px;
          margin-top: 10px;
        `)}
      >
        <div
          css={css(`
            font-size: 18px;
          `)}
        >
          {!props.digests && <div>Loading digests</div>}
          {props.digests?.length === 0 && (
            <div>
              No newsletters found! Clear filters to see all newsletters.
            </div>
          )}
        </div>

        {props.digests &&
          props.digests.length > 0 &&
          props.digests.map((digest) => {
            const readClassName = classnames({
              read: digest.read,
            });

            return (
              <Link
                key={digest.id}
                to={`/nl/${digest.newsletterId}/?digestId=${digest.id}`}
                css={css(`color: inherit;`)}
              >
                <div
                  css={css(`
                    margin: 10px 0 25px 0;
                    padding: 5px 10px;
                    display: flex;
                    flex-direction: row;
                  `)}
                >
                  <div
                    css={css(`
                      flex: 0 0 100px;
                      margin-top: 5px;
                      height: 100px;
                      overflow: hidden;
                      @media (max-width: 425px) {
                        flex: 0 0 60px;
                        height: 45px;
                      }
                    `)}
                    style={{
                      background: digest.previewImage
                        ? `center / cover no-repeat url(${digest.previewImage})`
                        : '#f6f6f6',
                    }}
                  ></div>

                  <div
                    className={readClassName}
                    css={css(`
                      flex: 1 0 300px;
                      margin-left: 15px;
                      color: var(--text-color);
                      &.read {
                        color: var(--read-digest-color);
                      }
                      @media (max-width: 425px) {
                        flex: 1 0 200px;
                      }
                    `)}
                  >
                    <h2
                      className={readClassName}
                      css={css(`
                        margin-bottom: 0;
                        &.read {
                          color: inherit !IMPORTANT;
                        }
                      `)}
                    >
                      {digest.title}
                    </h2>
                    <div css={css(`font-size: 11px;`)}>
                      {formatDate(
                        new Date(digest.receivedDate),
                        'LLL dd, yyyy'
                      )}
                    </div>
                    <div
                      css={css(`
                      font-size: 14px;
                    `)}
                    >
                      {digest.previewContent}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

        {shouldShowLoadMore && (
          <div>
            <button
              onClick={() =>
                props.loadMoreDigests({
                  offset: props.digests.length,
                })
              }
            >
              Load More
            </button>
            {/* TODO(sagar): prevent clicking 'Load More' button before last load more action is completed */}
          </div>
        )}
      </div>
    </div>
  );
};
DigestList.propTypes = {
  className: PropTypes.string,
  /** Redux */
  newsletters: PropTypes.array,
  digestFilters: PropTypes.object,
  digests: PropTypes.array,
  loadMoreDigests: PropTypes.func,
  updateDigestFilters: PropTypes.func,
};

/** Redux */
const mapStateToProps = (state) => {
  const { newsletters } = state;
  return {
    newsletters: newsletters?.publishers,
    digestFilters: newsletters?.digestFilters,
    digests: newsletters?.digests,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadMoreDigests: ({ offset }) =>
      dispatch({ type: NewslettersActions.LOAD_MORE_DIGESTS, offset }),
    updateDigestFilters: (filters) =>
      dispatch({ type: NewslettersActions.UPDATE_DIGEST_FILTERS, filters }),
  };
};

const connectedDigestList = connect(
  mapStateToProps,
  mapDispatchToProps
)(DigestList);

export { connectedDigestList as DigestList };
