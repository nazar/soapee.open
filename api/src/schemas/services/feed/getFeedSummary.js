import Feed from 'models/feed';
import summariser from 'services/summariser';

import getFeed from './getFeed';

export default function getFeedSummary() {
  const feedQuery = getFeed();

  return summariser(Feed, feedQuery);
}
