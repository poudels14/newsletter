import getPopulatingStatus from './getpopulatingstatus';
import highlight from './highlight';
import listDigests from './listdigests';
import listHighlights from './listhighlights';
import listNewsletters from './listnewsletters';
import listVerifiedNewsletters from './listverifiednewsletters';
import populate from './populate';
import viewNewsletter from './viewnewsletter';

const newsletters = {
  populate,
  getPopulatingStatus,
  listNewsletters,
  listVerifiedNewsletters,
  listDigests,
  viewNewsletter,
  highlight,
  listHighlights,
};

export { newsletters };
