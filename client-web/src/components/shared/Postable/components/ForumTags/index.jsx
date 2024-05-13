import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Label } from 'semantic-ui-react';

export default function ForumTags({ post }) {
  return !(_.isEmpty(post.forumTaggables)) && (
    <div className="post-forum-taggables" data-cy="post-forum-taggables">
      {_.map(post.forumTaggables, ({ forumTag }) => (
        <Label
          key={forumTag.id}
          content={forumTag.tag}
          color={forumTag.color}
          data-cy="post-forum-tag"
        />
      ))}
    </div>
  );
}

ForumTags.propTypes = {
  post: PropTypes.object.isRequired
};
