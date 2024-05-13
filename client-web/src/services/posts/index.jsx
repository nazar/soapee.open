import client from 'client';

import deletePostMutation from './queries/deletePost.gql';
import lockPostMutation from './queries/lockPost.gql';
import unlockPostMutation from './queries/unlockPost.gql';
import queryPost from './queries/post.gql';

export function deletePost(post) {
  return client.mutate({
    mutation: deletePostMutation,
    variables: {
      id: post.id
    }
  });
}

export function lockPost(post) {
  return client.mutate({
    mutation: lockPostMutation,
    variables: {
      id: post.id
    }
  });
}

export function unlockPost(post) {
  return client.mutate({
    mutation: unlockPostMutation,
    variables: {
      id: post.id
    }
  });
}

export function requeryPost(post) {
  // re-query the updated post using a network-only cache policy to
  // force reading off the server and to update the local cache store
  return client.query({
    fetchPolicy: 'network-only',
    query: queryPost,
    variables: { id: post.id }
  });
}
