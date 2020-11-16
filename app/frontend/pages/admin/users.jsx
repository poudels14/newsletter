import React, { useMemo, useState, useCallback } from 'react';

import ReactJson from 'react-json-view';
import axios from 'axios';
import { css } from '@emotion/react';

const Users = () => {
  const [users, setUsers] = useState();
  const [selectedCommand, setSelectedCommand] = useState('listNewsletters');
  const [selectedUserData, setSelectedUserData] = useState();

  const loadUserData = useCallback(
    async (userId) => {
      const { data } = await axios.get(
        `/api/admin/getUserData/${userId}/${selectedCommand}`
      );
      setSelectedUserData(data);
    },
    [selectedCommand]
  );

  useMemo(async () => {
    const { data } = await axios.get('/api/admin/listUsers');
    setUsers(data);
  }, []);
  return (
    <div className="flex">
      <table
        css={css(`
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
                <tr
                  key={i}
                  className="cursor-pointer hover:bg-red-500"
                  onClick={() => loadUserData(user.id)}
                >
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
      <div className="flex-1">
        <div>
          <select onChange={(e) => setSelectedCommand(e.target.value)}>
            <option value="listNewsletters">List Newsletters</option>
            <option value="listHighlights">List Highlights</option>
            <option value="listDigests">List Digests</option>
          </select>
        </div>
        <div>
          <ReactJson displayDataTypes={false} src={selectedUserData} />
        </div>
      </div>
    </div>
  );
};

export default Users;
