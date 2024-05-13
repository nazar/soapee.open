import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useCreation } from 'ahooks';

export default function CommentContext({ comment }) {
  const to = useCreation(() => getContextPath(comment), [comment]);

  return (
    <Button
      className="comment-context-component"
      as={Link}
      to={to}
      size="mini"
      data-cy="comment-context-button"
    >
      Context
    </Button>
  );
}

CommentContext.propTypes = {
  comment: PropTypes.object.isRequired
};

function getContextPath(comment) {
  const template = commentTypePaths[comment.commentableType];

  return _.template(template)({ id: comment.commentableId });
}

const commentTypePaths = {
  posts: '/posts/${id}',
  recipes: '/recipes/${id}'
};
