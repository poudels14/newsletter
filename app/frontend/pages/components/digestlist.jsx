import { Link } from 'react-router-dom';
import { PopulateNewsletters } from '../../components/populateNewsletters';
import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { css } from '@emotion/core';
import { format as formatDate } from 'date-fns';

const DigestList = (props) => {
  return (
    <div style={props.style}>
      <PopulateNewsletters.Dialog visible={!props.digests} />
      {props.digests &&
        Object.keys(props.digests).map((newsletterId) => {
          const newsletter = props.digests[newsletterId];
          const { name: newsletterName, authorName, authorEmail } = newsletter;
          const author = newsletterName || authorName || authorEmail;
          return (
            <div key={newsletterId}>
              {newsletter.digests &&
                newsletter.digests.map((digest) => {
                  const classNames = classnames({
                    read: digest.read,
                  });
                  return (
                    <Link
                      key={digest.id}
                      to={`?digestId=${digest.id}`}
                      css={css({ color: 'inherit' })}
                    >
                      <div
                        css={css({
                          margin: '10px 0 25px 0',
                          padding: '5px 10px',
                          display: 'flex',
                          flexDirection: 'row',
                        })}
                      >
                        <div
                          css={css({
                            flex: '0 0 100px',
                            marginTop: '5px',
                            height: '75px',
                            overflow: 'hidden',
                            background: `center / cover no-repeat url(${digest.previewImage})`,
                          })}
                        ></div>

                        <div
                          className={classNames}
                          css={css(`
                            flex: 1 0 400px;
                            margin-left: 15px;
                            &.read {
                              color: rgba(150, 150, 150, 0.7);
                            }
                          `)}
                        >
                          <h2
                            className={classNames}
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
                            {formatDate(
                              new Date(digest.receivedDate),
                              'LLL dd, yyyy'
                            )}
                          </div>
                          <div css={css({ fontSize: 15 })}>
                            {digest.previewContent}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          );
        })}
    </div>
  );
};
DigestList.propTypes = {
  style: PropTypes.object,
  /** Redux */
  digests: PropTypes.object,
};

/** Redux */
const mapStateToProps = (state) => {
  const { newsletters } = state;
  return {
    digests: newsletters?.digests,
  };
};

const connectedDigestList = connect(mapStateToProps)(DigestList);

export { connectedDigestList as DigestList };
