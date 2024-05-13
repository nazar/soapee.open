import React from 'react';
import PropTypes from 'prop-types';
import { Segment } from 'semantic-ui-react';

import client from 'client';
import { FormPost } from 'components/shared/Postable';

import createForumPostMutation from './queries/createForumPost.gql';

export default function CreateForumPost({ forum, onCreatedPost }) {
  return (
    <Segment className="create-forum-post-component">
      <h3>Create Forum Post</h3>

      <FormPost
        tagsForForumId={forum.id}
        onSave={handleCreatePost}
      />
    </Segment>
  );

  function handleCreatePost(values) {
    const input = {
      ...values,
      forumId: forum.id
    };

    return client
      .mutate({
        mutation: createForumPostMutation,
        variables: { input }
      })
      .then(({ data: { createForumPost } }) => onCreatedPost(createForumPost));
  }
}

CreateForumPost.defaultProps = {
  forum: null
};

CreateForumPost.propTypes = {
  forum: PropTypes.object,
  onCreatedPost: PropTypes.func.isRequired
};
