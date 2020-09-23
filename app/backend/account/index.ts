import getProfile from './getprofile';
import { gmail } from './gmail';
import unlinkGmail from './unlinkgmail';
import updateSettings from './updateSettings';

const account = {
  gmail,
  getProfile,
  updateSettings,
  unlinkGmail,
};

export { account };
