import { Cookies } from 'Http/cookies';
import { Router } from 'Http/router';
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

export { routes };
