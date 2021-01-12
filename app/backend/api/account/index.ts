import deleteAccount from './deleteaccount';
import getProfile from './getprofile';
import getSettings from './getsettings';
import getIntegrations from './getIntegrations';
import { gmail } from './gmail';
import unlinkGmail from './unlinkgmail';
import updateSettings from './updateSettings';
import setReadwiseToken from './setReadwiseToken';

const account = {
  gmail,
  getProfile,
  getSettings,
  getIntegrations,
  updateSettings,
  unlinkGmail,
  setReadwiseToken,
  deleteAccount,
};

export { account };
