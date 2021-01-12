import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'antd';

import GoBackIcon from 'heroicons/solid/arrow-circle-left.svg';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { css } from '@emotion/react';

const Profile = (props) => {
  return (
    <div>
      <h2
        className="text-center font-bold"
        css={css(`
          margin-bottom: 15px;
        `)}
      >
        Profile
      </h2>
      <div>
        <h3>
          Name:{' '}
          <b>
            {props.firstName} {props.lastName}
          </b>
        </h3>
        <h3>
          Linked Email: <b>{props.email}</b>
        </h3>
        {/* <div>
          <h3>
            Alpine Email: <b>{settings.mailgunEmail}</b>
          </h3>
          <div
            css={css(`
            font-size: 12px;
            padding: 0 25px;
          `)}
          >
            Alpine email is a seperate email address that is given to each
            account. When you use this email address to sign up
            newsletters, emails you receive will be imported in the
            reader. Optionally, you can forward the email to your private
            email as well for future reference.
            <br />
            <br />
            <div>
              <Switch
                defaultChecked={true}
                checkedChildren="Forwarding on"
                unCheckedChildren="Forwarding off"
                css={css(`
                  padding: 0 10px;
                  background-color: #2c3a61;
                `)}
                // onChange={toggleUnreadOnly}
              />
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};
Profile.propTypes = {
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  email: PropTypes.string,
};

// const Billing = () => {
//   return (
//     <div
//         css={css(`
//           width: 100%;
//           padding: 25px 0;
//         `)}
//       >
//         <div
//           css={css(`
//             text-align: center;
//             margin-bottom: 15px;
//           `)}
//         >
//           <h2>Billing</h2>
//         </div>
//         <div>You are on a free plan.</div>
//       </div>
//   )
// }

const Integrations = () => {
  return (
    <div>
      <h2
        className="text-center font-bold"
        css={css(`
          margin-bottom: 15px;
        `)}
      >
        Integrations
      </h2>
      <div>
        <Link to="/integrations">
          <span className="align-middle font-bold">Manage Integrations</span>
        </Link>
      </div>
    </div>
  );
};

const Newsletters = ({ newsletters }) => {
  return (
    <div>
      <div
        className="text-center"
        css={css(`
          margin-bottom: 25px;
        `)}
      >
        <h2 className="mb-0 font-bold">Newsletters</h2>
        <div
          css={css(`
          font-size: 12px;
          padding: 0 25px;
        `)}
        >
          This is a list of all the newsletters that you are subscribed to. If
          you are subscribed to a newsletter but you don&apos;t find it in the
          list below, please contact help@alpinereader.com
        </div>
      </div>

      <table
        width="100%"
        css={css(`
          td {
            padding: 10px 0;
            &:nth-of-type(3) {
              width: 200px;
            }
          }
        `)}
      >
        <tbody>
          {newsletters &&
            newsletters.map((newsletter) => {
              return (
                <tr key={newsletter.id}>
                  <td>
                    <b>{newsletter.name}</b>
                  </td>
                  <td>
                    <b>{newsletter.authorEmail}</b>
                  </td>
                  <td>
                    {/* <Switch
                      defaultChecked={true}
                      checkedChildren="Shown in the reader"
                      unCheckedChildren="Hidden"
                      css={css(`
                      padding: 0 10px;
                      background-color: #2c3a61;
                    `)}
                      // onChange={toggleUnreadOnly}
                    /> */}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};
Newsletters.propTypes = {
  newsletters: PropTypes.array,
};

const DangerZone = ({ uIState, updateUIState }) => {
  const deleteAccount = useCallback(() => {
    updateUIState({ accountDeleteInProgress: true });
    axios.post('/api/account/deleteAccount').then(() => {
      window.location = '/';
    });
  }, []);

  return (
    <div>
      <h2
        className="text-center font-bold"
        css={css(`
          margin-bottom: 15px;
        `)}
      >
        Danger Zone
      </h2>
      <div
        css={css(`
          margin-bottom: 10px;
          a {
            text-decoration: underline;
          }
        `)}
      >
        Don&apos;t want to use Alpine reader anymore?{' '}
        <Link
          to="#"
          onClick={() => updateUIState({ deleteAccountPromptVisible: true })}
        >
          Delete Your Account
        </Link>
        <Modal
          title="Confirm account deletion"
          visible={uIState?.deleteAccountPromptVisible}
          onCancel={() => {
            if (!uIState?.accountDeleteInProgress) {
              updateUIState({ deleteAccountPromptVisible: false });
            }
          }}
          footer={[
            <Button
              key="back"
              onClick={() =>
                updateUIState({ deleteAccountPromptVisible: false })
              }
              disabled={uIState?.accountDeleteInProgress}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              danger
              loading={uIState?.accountDeleteInProgress}
              onClick={deleteAccount}
            >
              {uIState?.accountDeleteInProgress ? 'Deleting...' : 'Delete'}
            </Button>,
          ]}
        >
          <p>
            When you delete your account, all your data will be lost and
            can&apos;t be recovered
          </p>
          <p>
            <b>Please confirm you want to delete your account.</b>
          </p>
        </Modal>
      </div>
    </div>
  );
};
DangerZone.propTypes = {
  uIState: PropTypes.object,
  updateUIState: PropTypes.func,
};

const Settings = () => {
  const [uIState, setUIState] = useState({
    gmailLinked: false,
    unlinkGmailPromptVisible: false,
    gmailUnlinkInProgress: false,

    deleteAccountPromptVisible: false,
    accountDeleteInProgress: false,
  });
  const updateUIState = useCallback(
    (changes) => {
      setUIState((state) => {
        return {
          ...state,
          ...changes,
        };
      });
    },
    [setUIState]
  );
  const [settings, setSettings] = useState();
  useMemo(async () => {
    const { data } = await axios.get('/api/account/getSettings');
    setSettings(data);
    updateUIState({ gmailLinked: data.hasRequiredAccess });
  }, []);

  if (!settings) {
    return <div>Loading...</div>;
  }
  return (
    <div
      className="settings"
      css={css(`
        font-size: 14px;
        background: white;
        min-height: 100%;
        display: flex;
        flex-direction: row;
      `)}
    >
      <div
        className="shadow space-y-8"
        css={css(`
          flex: 1 1 300px;
          max-width: 800px;
          margin: 0 auto;
          padding: 15px 15px;
        `)}
      >
        <div
          css={css(`
            margin-bottom: 10px;
            a {
              color: inherit;
            }
          `)}
        >
          <Link to="/">
            <GoBackIcon width="24px" className="inline" />
            <span className="align-middle"> Go back to the reader</span>
          </Link>
        </div>

        <Profile {...settings} />
        {/* <Billing /> */}
        <Integrations />
        <Newsletters newsletters={settings.newsletters} />
        <DangerZone uIState={uIState} updateUIState={updateUIState} />
      </div>
    </div>
  );
};

export default Settings;
