import { Cookies } from 'Http/cookies';
import { Router } from 'Http/router';
import { account } from './account';
import { admin } from './admin';
import { newsletters } from './newsletters';

const routes = new Router();

routes.post('/account/gmail/authorize', account.gmail.setAuthorizationCode);
routes.post('/account/gmail/signin', account.gmail.gmailSign);
routes.get('/account/profile', account.getProfile);

routes.get('/admin/listUsers', Cookies.authorizedOnly(), admin.listUsers);
routes.get(
  '/admin/listNewsletters',
  Cookies.authorizedOnly(),
  admin.listNewsletters
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

export { routes };
