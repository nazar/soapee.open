import client from 'client';

import deleteCommentQuery from '../queries/deleteComment.gql';

export default function deleteComment(comment) {
  return client.mutate({
    mutation: deleteCommentQuery,
    variables: {
      id: comment.id
    },
    refetchQueries: ['commentableComments']
  });
}
