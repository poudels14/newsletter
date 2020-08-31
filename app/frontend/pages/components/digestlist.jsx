import React, { useMemo } from 'react';

import { Link } from 'react-router-dom';
import { Actions as NewslettersActions } from '../../controllers/newsletters';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { css } from '@emotion/core';
import { format as formatDate } from 'date-fns';

const DigestList = (props) => {
  const selectedNewsletter = useMemo(() => {
    return props.newsletters?.filter(
      (n) => n.id == props.selectedNewsletterId
    )[0];
  }, [props.newsletters, props.selectedNewsletterId]);

  return (
    <div className={props.className}>
      {props.digests?.length === 0 && <div>Loading digests</div>}
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
                    height: 75px;
                    overflow: hidden;
                    @media (max-width: 425px) {
                      flex: 0 0 60px;
                      height: 45px;
                    }
                  `)}
                  style={{
                    background: `center / cover no-repeat url(${digest.previewImage})`,
                  }}
                ></div>

                <div
                  className={readClassName}
                  css={css(`
                    flex: 1 0 300px;
                    margin-left: 15px;
                    &.read {
                      color: rgba(150, 150, 150, 0.7);
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
                  <div>
                    {formatDate(new Date(digest.receivedDate), 'LLL dd, yyyy')}
                  </div>
                  <div css={css(`font-size: 15;`)}>{digest.previewContent}</div>
                </div>
              </div>
            </Link>
          );
        })}
      {selectedNewsletter &&
      props.digests &&
      props.digests.length > 0 && // this is so that load more only appears after the initial digest list is loaded
        props.digests.length < selectedNewsletter?.totalDigests && (
          <div>
            <button
              onClick={() =>
                props.loadMoreDigests({
                  publisher: selectedNewsletter.id,
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
  );
};
DigestList.propTypes = {
  className: PropTypes.string,
  /** Redux */
  newsletters: PropTypes.array,
  selectedNewsletterId: PropTypes.string,
  digests: PropTypes.array,
  loadMoreDigests: PropTypes.func,
};

/** Redux */
const mapStateToProps = (state) => {
  const { newsletters } = state;
  return {
    newsletters: newsletters?.publishers,
    selectedNewsletterId: newsletters?.selectedPublisher,
    digests: newsletters?.digests,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadMoreDigests: (config) =>
      dispatch({ type: NewslettersActions.LOAD_MORE_DIGESTS, ...config }),
  };
};

const connectedDigestList = connect(
  mapStateToProps,
  mapDispatchToProps
)(DigestList);

export { connectedDigestList as DigestList };
