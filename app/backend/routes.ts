import { Router } from 'Http/router';
import { Cookies } from 'Http/cookies';

import { account } from './account';
import { newsletters } from './newsletters';

const routes = new Router();

routes.post('/account/gmail/authorize', account.gmail.setAuthorizationCode);
routes.post('/account/gmail/signin', account.gmail.gmailSign);

routes.get(
  '/newsletters/populate',
  Cookies.authorizedOnly(),
  newsletters.populate
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

export { routes };
