import Comment from 'models/comment';

import getCommentableComments from 'schemas/services/comment/getCommentableComments';
import summariser from 'services/summariser';

export default function getRecipesSummary({ commentable }) {
  const commentableQuery = getCommentableComments({ commentable });

  return summariser(Comment, commentableQuery);
}
