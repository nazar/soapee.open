import Comment from 'models/comment';

import getComments from 'schemas/services/comment/getComments';
import summariser from 'services/summariser';

export default function getCommentsSummary({ search }) {
  const posts = getComments({ search });

  return summariser(Comment, posts);
}
