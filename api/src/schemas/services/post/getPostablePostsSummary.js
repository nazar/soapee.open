import Post from 'models/post';

import getPostablePosts from 'schemas/services/post/getPostablePosts';
import summariser from 'services/summariser';

export default function getRecipesSummary({ postable, user }) {
  const postableQuery = getPostablePosts({ postable, user });

  return summariser(Post, postableQuery);
}
