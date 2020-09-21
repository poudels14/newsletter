import React, { useMemo, useState } from 'react';

import axios from 'axios';
import { css } from '@emotion/core';

const VerifiedNewsletters = () => {
  const [newsletters, setNewsletters] = useState();

  useMemo(async () => {
    const { data } = await axios.get('/api/newsletters/verified');
    setNewsletters(data);
  }, []);
  return (
    <div>
      <table
        css={css(`
        width: 100%;
        border-spacing: 0;
        border: 1px solid black;

        tr {
          :last-child {
            td {
              border-bottom: 0;
            }
          }
        }
        th,
        td {
          margin: 0;
          padding: 0.5rem;
          border-bottom: 1px solid black;
          border-right: 1px solid black;
          :last-child {
            border-right: 0;
          }
        }
      `)}
      >
        <thead>
          <tr>
            <th>Newsletter</th>
            <th>Author Name</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>All Substack newsletters</td>
            <td></td>
          </tr>
          {newsletters &&
            newsletters.map((newsletter, i) => {
              return (
                <tr key={i}>
                  <td>{newsletter.name}</td>
                  <td>{newsletter.authorName}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default VerifiedNewsletters;
