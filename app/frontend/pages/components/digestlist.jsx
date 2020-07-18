import { PopulateNewsletters } from '../../components/populateNewsletters';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { css } from '@emotion/core';

const DigestList = (props) => {
  return (
    <div>
      <div>
        <PopulateNewsletters.Dialog visible={!props.digests} />
        {props.digests &&
          Object.keys(props.digests).map((newsletterId) => {
            const newsletter = props.digests[newsletterId];
            const {
              name: newsletterName,
              authorName,
              authorEmail,
            } = newsletter;
            const author = newsletterName || authorName || authorEmail;
            return (
              <div key={newsletterId}>
                <div>{author}</div>
                <div>
                  {newsletter.digests &&
                    newsletter.digests.map((digest) => {
                      return (
                        <div
                          key={digest.id}
                          css={css({ padding: '10px 30px' })}
                        >
                          <a href={`/${digest.contentUrl}`}>{digest.title}</a>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
DigestList.propTypes = {
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
