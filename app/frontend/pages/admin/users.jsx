import React, { useMemo, useState } from 'react';

import axios from 'axios';
import { css } from '@emotion/core';

const Users = () => {
  const [users, setUsers] = useState();

  useMemo(async () => {
    const { data } = await axios.get('/api/admin/listUsers');
    setUsers(data);
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
            <th>First name</th>
            <th>Last name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users &&
            users.map((user, i) => {
              return (
                <tr key={i}>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
