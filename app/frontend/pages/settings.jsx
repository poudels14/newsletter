import { Button, Layout, Modal } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { css } from '@emotion/core';

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

  const deleteAccount = useCallback(() => {
    updateUIState({ accountDeleteInProgress: true });
    axios.post('/api/account/deleteAccount').then(() => {
      window.location = '/';
    });
  }, []);

  const unlinkGmail = useCallback(() => {
    updateUIState({
      gmailUnlinkInProgress: true,
    });
    axios.post('/api/account/unlinkGmail').then(() => {
      updateUIState({
        gmailLinked: false,
      });
    });
  }, []);

  if (!settings) {
    return <div>Loading...</div>;
  }
  return (
    <div
      css={css(`
        height: 100%;
        font-size: 14px;
      `)}
    >
      <Layout
        className="settings"
        css={css(`
          background: white;
          min-height: 100%;
          display: flex;
          flex-direction: row;
        `)}
      >
        <Layout.Content
          css={css(`
            flex: 1 1 700px;
            max-width: 700px;
            margin: 0 auto;
            padding: 50px 50px;
            // background: #1971a5;
            background: #003e63;
            color: white;
            h2, h3, a, a:hover {
              color: white;
            }
          `)}
        >
          <div>
            <Link to="/">
              <ArrowLeftOutlined /> Go back to the reader
            </Link>
          </div>

          <div
            css={css(`
              width: 100%;
              padding: 25px 0;
            `)}
          >
            <div
              css={css(`
                text-align: center;
                margin-bottom: 15px;
              `)}
            >
              <h2>Profile</h2>
            </div>
            <div>
              <div>
                <h3>
                  Name:{' '}
                  <b>
                    {settings.firstName} {settings.lastName}
                  </b>
                </h3>
              </div>
              <h3>
                Linked Email: <b>{settings.email}</b>
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

          {/* <div
            css={css(`
              width: 100%;
              padding: 25px 0;
            `)}
          >
            <div
              css={css(`
                text-align: center;
                margin-bottom: 15px;
              `)}
            >
              <h2>Billing</h2>
            </div>
            <div>You are on a free plan.</div>
          </div> */}

          <div
            css={css(`
              width: 100%;
              padding: 25px 0;
            `)}
          >
            <div
              css={css(`
                text-align: center;
                margin-bottom: 25px;
              `)}
            >
              <h2 css={css(`margin-bottom: 0;`)}>Newsletters</h2>
              <div
                css={css(`
                font-size: 12px;
                padding: 0 25px;
              `)}
              >
                This is a list of all the newsletters that you are subscribed
                to. If you are subscribed to a newsletter but you don&apos;t
                find it in the list below, please contact help@alpinereader.com
                and we will resolve the issue.
              </div>
            </div>
            <div>
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
                  {settings.newsletters &&
                    settings.newsletters.map((newsletter) => {
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
          </div>

          <div
            css={css(`
              width: 100%;
              padding: 25px 0;
            `)}
          >
            <div
              css={css(`
                text-align: center;
                margin-bottom: 15px;
              `)}
            >
              <h2>Danger Zone</h2>
            </div>
            <div
              css={css(`
                margin-bottom: 10px;
                a {
                  text-decoration: underline;
                }
              `)}
            >
              Don&apos;t want to import newsletters from you gmail?{' '}
              {uIState.gmailLinked ? (
                <Link
                  to="#"
                  onClick={() =>
                    updateUIState({ unlinkGmailPromptVisible: true })
                  }
                >
                  Unlink Gmail
                </Link>
              ) : (
                <a href="/grantaccess">Link Gmail</a>
              )}
              <Modal
                title="Confirm unlinking Gmail"
                visible={uIState?.unlinkGmailPromptVisible}
                onCancel={() => {
                  if (!uIState?.gmailUnlinkInProgress) {
                    updateUIState({ unlinkGmailPromptVisible: false });
                  }
                }}
                footer={[
                  <Button
                    key="back"
                    onClick={() =>
                      updateUIState({ unlinkGmailPromptVisible: false })
                    }
                    disabled={uIState?.gmailUnlinkInProgress}
                  >
                    Cancel
                  </Button>,
                  <Button
                    key="submit"
                    type="primary"
                    danger
                    loading={uIState?.gmailUnlinkInProgress}
                    onClick={unlinkGmail}
                  >
                    {uIState?.gmailUnlinkInProgress ? 'Unlinking...' : 'Unlink'}
                  </Button>,
                ]}
              >
                <p>
                  Once you unlink your gmail, the app can&apos;t access your
                  email and new email digests won&apos;t be imported from Gmail
                </p>
                <p>
                  <b>Please confirm you want to unlink Gmail.</b>
                </p>
              </Modal>
            </div>
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
                onClick={() =>
                  updateUIState({ deleteAccountPromptVisible: true })
                }
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
                    {uIState?.accountDeleteInProgress
                      ? 'Deleting...'
                      : 'Delete'}
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
        </Layout.Content>
      </Layout>
    </div>
  );
};

export default Settings;
