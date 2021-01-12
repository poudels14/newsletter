import { Cookies } from 'Http';
import { Router } from 'Http';
import { account } from './account';
import { admin } from './admin';
import { newsletters } from './newsletters';

const routes = new Router();

routes.post('/account/gmail/authorize', account.gmail.setAuthorizationCode);
routes.post('/account/gmail/signin', account.gmail.gmailSign);

// Note(sagar): /account/profile should be a public url. it's used to determine if user is logged in
routes.get('/account/profile', account.getProfile);
routes.get('/newsletters/verified', newsletters.listVerifiedNewsletters);

/*********************** private routes ***********/

/** admin routes */
routes.get('/admin/listUsers', Cookies.authorizedOnly(), admin.listUsers);
routes.get(
  '/admin/listNewsletters',
  Cookies.authorizedOnly(),
  admin.listNewsletters
);
routes.get('/admin/runCommand', Cookies.authorizedOnly(), admin.runCommand);
routes.get(
  '/admin/getUserData/:userId/:command',
  Cookies.authorizedOnly(),
  admin.getUserData
);

/** user routes */
routes.get(
  '/account/getSettings',
  Cookies.authorizedOnly(),
  account.getSettings
);
routes.post(
  '/account/updateSettings',
  Cookies.authorizedOnly(),
  account.updateSettings
);
routes.get(
  '/account/integrations',
  Cookies.authorizedOnly(),
  account.getIntegrations
);
routes.post(
  '/account/unlinkGmail',
  Cookies.authorizedOnly(),
  account.unlinkGmail
);
routes.post(
  '/account/setReadwiseToken',
  Cookies.authorizedOnly(),
  account.setReadwiseToken
);
routes.post(
  '/account/deleteAccount',
  Cookies.authorizedOnly(),
  account.deleteAccount
);
routes.get(
  '/newsletters/populate',
  Cookies.authorizedOnly(),
  newsletters.populate
);
routes.get(
  '/newsletters/populate/status',
  Cookies.authorizedOnly(),
  newsletters.getPopulatingStatus
);
routes.get(
  '/newsletters/listNewsletters',
  Cookies.authorizedOnly(),
  newsletters.listNewsletters
);
routes.get(
  '/newsletters/listDigests',
  Cookies.authorizedOnly(),
  newsletters.listDigests
);
routes.get(
  '/newsletters/view/:newsletterId/:digestId',
  Cookies.authorizedOnly(),
  newsletters.viewNewsletter
);
routes.post(
  '/newsletters/highlight',
  Cookies.authorizedOnly(),
  newsletters.highlight
);
routes.get(
  '/newsletters/listHighlights',
  Cookies.authorizedOnly(),
  newsletters.listHighlights
);
routes.post(
  '/newsletters/digest/updateConfig',
  Cookies.authorizedOnly(),
  newsletters.updateDigestConfig
);

export { routes };
