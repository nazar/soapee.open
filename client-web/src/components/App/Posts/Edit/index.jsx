import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Breadcrumb, Container, Message, Segment } from 'semantic-ui-react';
import { useParams, useHistory, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useCreation } from 'ahooks';

import client from 'client';
import useCurrentUser from 'hooks/useCurrentUser';
import Section from 'components/shared/Section';
import { FormPost } from 'components/shared/Postable';

import getPostForEdit from './queries/getPostForEdit.gql';
import updatePostMutation from './queries/updatePost.gql';
import updateForumPostMutation from './queries/updateForumPost.gql';

export default function EditPost() {
  const { postId } = useParams();
  const { push } = useHistory();
  const currentUser = useCurrentUser();

  const { loading, data: { post } = {} } = useQuery(getPostForEdit, {
    variables: { id: postId }
  });

  const canEdit = useCreation(
    () => (_.get(post, 'userId') === _.get(currentUser, 'id'))
      || currentUser?.isAdmin
      || post?.postable?.userCanEdit,
    [post, currentUser]
  );

  const noPost = _.isEmpty(post) && !(loading);

  return (
    <Container id="root-edit-post">
      {noPost && (
        <Message
          negative
          header="Post not found"
          data-cy="post-not-found-message"
        />
      )}

      <Bread post={post} />

      {post && (
        <Helmet>
          <title>{post.title} - Soapee</title>
          <meta name="description" content={post.contentStr} />
        </Helmet>
      )}

      {post && !(canEdit) && (
        <Message
          negative
          header="Cannot Edit Post"
          content="Only the Post owner can edit this post"
          data-cy="post-cannot-edit-message"
        />
      )}

      <Section loading={loading} data-cy="edit-postable-post">
        {post && canEdit && (
          <FormPost
            useLabels
            post={post}
            tagsForForumId={post.postableType === 'forums' ? post.postableId : null}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </Section>
    </Container>
  );

  function handleSave(values) {
    const mutation = post.postableType === 'forums' ? updateForumPostMutation : updatePostMutation;

    return client
      .mutate({
        mutation,
        variables: { input: { id: postId, ...values } }
      })
      .then(() => push(`/posts/${post.id}`));
  }

  function handleCancel() {
    push(`/posts/${post.id}`);
  }
}

function Bread({ post }) {
  const name = _.get(post, 'postable.name') || _.chain(post).get('postableType').capitalize().value();
  const postableId = _.get(post, 'postableId');
  const postableType = _.get(post, 'postableType');
  const potableTypeUrl = postableType === 'forums' ? '/forums/home' : `/${postableType}`;

  return !(_.isEmpty(post)) && (
    <Segment>
      <Breadcrumb>
        <Breadcrumb.Section as={Link} to="/">Home</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section as={Link} to={potableTypeUrl}>
          {_.capitalize(postableType)}
        </Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section as={Link} to={`/${postableType}/${postableId}`}>
          {name}
        </Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section>editing</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section active>
          {post?.title}
        </Breadcrumb.Section>
      </Breadcrumb>
    </Segment>
  );
}

Bread.defaultProps = {
  post: null
};

Bread.propTypes = {
  post: PropTypes.object
};
