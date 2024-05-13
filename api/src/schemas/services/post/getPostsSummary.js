import Post from 'models/post';

import getPosts from 'schemas/services/post/getPosts';
import summariser from 'services/summariser';

export default function getRecipesSummary({ search }) {
  const posts = getPosts({ search });

  return summariser(Post, posts);
}
