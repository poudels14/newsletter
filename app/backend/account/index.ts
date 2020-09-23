import deleteAccount from './deleteaccount';
import getProfile from './getprofile';
import getSettings from './getsettings';
import { gmail } from './gmail';
import unlinkGmail from './unlinkgmail';
import updateSettings from './updateSettings';

const account = {
  gmail,
  getProfile,
  getSettings,
  updateSettings,
  unlinkGmail,
  deleteAccount,
};

export { account };
