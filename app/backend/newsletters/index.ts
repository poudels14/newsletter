import getPopulatingStatus from './getpopulatingstatus';
import highlight from './highlight';
import listDigests from './listdigests';
import listNewsletters from './listnewsletters';
import populate from './populate';
import viewNewsletter from './viewnewsletter';

const newsletters = {
  populate,
  listNewsletters,
  listDigests,
  viewNewsletter,
  highlight,
  getPopulatingStatus,
};

export { newsletters };
