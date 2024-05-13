import Additive from 'models/additive';

import getAdditives from 'schemas/services/additive/getAdditives';
import summariser from 'services/summariser';

export default function getAdditivesSummary({ search, user }) {
  const forumsQuery = getAdditives({ search, user });

  return summariser(Additive, forumsQuery);
}
