import React, { useCallback, useMemo } from 'react';

import { Link } from 'react-router-dom';
import { Actions as NewslettersActions } from '../../controllers/newsletters';
import PublisherInfo from './digestlist/publisherinfo';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { css } from '@emotion/react';
import { format as formatDate } from 'date-fns';
import Switch from 'ui/Switch';

const DigestList = (props) => {
  const selectedNewsletter = useMemo(() => {
    return props.publishers?.filter(
      (n) => n.id == props.digestFilters?.newsletterId
    )[0];
  }, [props.publishers, props.digestFilters?.newsletterId]);

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
        margin: 10px auto 50px auto;
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
          checked={props.digestFilters?.unreadOnly}
          toggle={toggleUnreadOnly}
          checkedChildren="Unread Only"
          unCheckedChildren="All"
          unCheckedClassName="bg-blue-500 border-blue-500"
          checkedClassName="bg-blue-500"
          unCheckedKnobClassName="bg-white"
          checkedKnobClassName="bg-white"
        />
      </div>
      {selectedNewsletter && <PublisherInfo publisher={selectedNewsletter} />}
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
                    className={classnames({
                      'read text-gray-400': digest.read,
                      'unread text-gray-800': !digest.read,
                    })}
                    css={css(`
                      flex: 1 0 300px;
                      margin-left: 15px;
                      @media (max-width: 425px) {
                        flex: 1 0 200px;
                      }
                    `)}
                  >
                    <div
                      css={css(`
                        font-size: 19px;
                        margin-bottom: 0;
                      `)}
                    >
                      {digest.title}
                    </div>
                    <div
                      className={classnames({
                        'unread font-bold': !digest.read,
                      })}
                      css={css(`
                        font-size: 15px;
                        margin-bottom: 0;
                      `)}
                    >
                      {props.publishersById &&
                        props.publishersById[digest.newsletterId]?.name}
                    </div>
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
              className="w-full py-2 bg-gray-100 text-sm rounded border hover:bg-gray-200"
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
  publishers: PropTypes.array,
  publishersById: PropTypes.object,
  digestFilters: PropTypes.object,
  digests: PropTypes.array,
  loadMoreDigests: PropTypes.func,
  updateDigestFilters: PropTypes.func,
};

/** Redux */
const mapStateToProps = (state) => {
  const { newsletters } = state;
  return {
    publishers: newsletters?.publishers,
    digestFilters: newsletters?.digestFilters,
    digests: newsletters?.digests,
    publishersById: newsletters?.publishersById || {},
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
