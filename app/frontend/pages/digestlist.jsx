import { css } from '@emotion/core';
import React, { useState, useMemo } from 'react';
import axios from 'axios';

import { PopulateNewsletters } from '../components/populateNewsletters';

const DigestList = () => {
  const [state, setState] = useState({});
  const [modalOpen, setModalOpen] = useState(true);

  useMemo(async () => {
    // Note(sagar): first trigger newletter load on server before showing the digests
    //              we can decide on backend how long we want the dialog to appear
    PopulateNewsletters.run().then(async () => {
      const { data } = await axios.get('/api/newsletters/listDigests');
      setState({ newsletters: data });
      setModalOpen(false);
    });
  }, []);

  return (
    <div>
      <div>
        {modalOpen && <PopulateNewsletters.Dialog visible={modalOpen} />}
        {state.newsletters &&
          Object.keys(state.newsletters).map((newsletterId) => {
            const newsletter = state.newsletters[newsletterId];
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
                          <a href={digest.contentUrl}>{digest.title}</a>
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

export { DigestList };
