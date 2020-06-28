import { Router } from 'Http/router';

import setAuthorizationCode from './account/gmail/setAuthorizationCode';
import gmailSign from './account/gmail/signin';

const routes = new Router();

routes.post('/account/gmail/authorize', setAuthorizationCode);
routes.post('/account/gmail/signin', gmailSign);

export { routes };
