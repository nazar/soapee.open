import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useCreation } from 'ahooks';

export default function PostContext({ post }) {
  const to = useCreation(() => getContextPath(post), [post]);

  return (
    <Button
      className="post-context-component"
      as={Link}
      to={to}
      size="mini"
      data-cy="post-context-button"
    >
      Context
    </Button>
  );
}

PostContext.propTypes = {
  post: PropTypes.object.isRequired
};

function getContextPath(post) {
  const template = postTypePaths[post.postableType];

  return _.template(template)({ id: post.postableId });
}

const postTypePaths = {
  oils: '/oils/${id}',
  forums: '/forums/${id}'
};
