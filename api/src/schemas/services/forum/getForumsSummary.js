import Forum from 'models/forum';

import getForums from 'schemas/services/forum/getForums';
import summariser from 'services/summariser';

export default function getForumsSummary({ search, currentUser }) {
  const forumsQuery = getForums({ search, currentUser });

  return summariser(Forum, forumsQuery);
}
