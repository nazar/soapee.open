import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb, Container, Segment, Message } from 'semantic-ui-react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useQuery } from '@apollo/client';
import { useCreation } from 'ahooks';

import useCurrentUser from 'hooks/useCurrentUser';
import { deletePost, lockPost, unlockPost } from 'services/posts';

import Commentable from 'components/shared/Commentable';
import Section from 'components/shared/Section';

import PostDetail from './components/PostDetail';

import getPostQuery from './queries/getPost.gql';

import './viewPosts.styl';


export default function View() {
  const { postId } = useParams();
  const currentUser = useCurrentUser();

  const { refetch, loading, data: { post } = {} } = useQuery(getPostQuery, {
    variables: { id: postId }
  });

  const canAdminOrModerate = useCreation(
    () => _.get(post, 'userId') === _.get(currentUser, 'id'),
    [post, currentUser]
  );

  const noPost = _.isEmpty(post) && !(loading);

  return (
    <Container className="view-posts view-page">
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

      <Section loading={loading}>
        {post && (
          <PostDetail
            post={post}
            canModerate={canAdminOrModerate}
            onDelete={handleDelete}
            onLock={handleLock}
            onUnlock={handleUnlock}
            onReload={handleReload}
          />
        )}

        <Commentable
          commentableId={postId}
          commentableType="posts"
          canComment={!(post && post.locked)}
          initialSortOrder={initialSortOrder}
          extraSortOptions={extraSortOptions}
          canModerate={canAdminOrModerate}
        />
      </Section>
    </Container>
  );

  function handleDelete() {
    return deletePost(post)
      .then(handleReload);
  }

  function handleLock() {
    return lockPost(post)
      .then(handleReload);
  }

  function handleUnlock() {
    return unlockPost(post)
      .then(handleReload);
  }

  function handleReload() {
    return refetch();
  }
}

function Bread({ post }) {
  const name = _.get(post, 'postable.name') || _.chain(post).get('postableType').capitalize().value();
  const postableId = _.get(post, 'postableId');
  const postableType = _.get(post, 'postableType');
  const potableTypeUrl = postableType === 'forums' ? '/forums/home' : `/${postableType}`;

  return (
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
        <Breadcrumb.Section active>viewing post</Breadcrumb.Section>
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

const initialSortOrder = { value: { field: 'latestActivity', direction: 'desc' }, text: 'Latest Activity', key: 1 };
const extraSortOptions = [initialSortOrder];
