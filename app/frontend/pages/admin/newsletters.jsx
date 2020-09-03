import React, { useMemo, useState } from 'react';

import axios from 'axios';
import { css } from '@emotion/core';

const Newsletters = () => {
  const [newsletters, setNewsletters] = useState();

  useMemo(async () => {
    const { data } = await axios.get('/api/admin/listNewsletters');
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
            <th>Id</th>
            <th>Name</th>
            <th>Author Name</th>
            <th>Visible</th>
            <th>Author Email</th>
          </tr>
        </thead>
        <tbody>
          {newsletters &&
            newsletters.map((newsletter, i) => {
              return (
                <tr key={i}>
                  <td>{newsletter.id}</td>
                  <td>{newsletter.name}</td>
                  <td>{newsletter.authorName}</td>
                  <td>{newsletter.visible}</td>
                  <td>{newsletter.authorEmail}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default Newsletters;
