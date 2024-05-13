import _ from 'lodash';
import React, {  forwardRef, useState, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { Message, Segment, Transition } from 'semantic-ui-react';

import useCurrentUser from 'hooks/useCurrentUser';
import usePaginator from 'hooks/usePaginator';

import LoginToCreatePostCTA from 'components/shared/LoginToCreatePostCTA';
import Section from 'components/shared/Section';
import SortOptionsBar, { newestFirstOrder } from 'components/shared/SortOptionsBar';

import UberPaginator from 'components/shared/UberPaginator';


import PostSummary from '../PostSummary';

import postablePostsQuery from './queries/postablePosts.gql';
import postablePostsSummaryQuery from './queries/postablePostsSummary.gql';

function Posts({
  postableId,
  postableType,
  entityName,
  canPost,
  canAdmin,
  showContext,
  extraSortOptions,
  initialSortOrder
}, ref) {
  const [order, setOrder] = useState(initialSortOrder || newestFirstOrder);
  const currentUser = useCurrentUser();

  const variables = {
    postable: {
      postableId,
      postableType
    }
  };

  const summaryQuery = {
    query: postablePostsSummaryQuery,
    dataKey: 'postablePostsSummary',
    variables
  };

  const itemsQuery = {
    query: postablePostsQuery,
    dataKey: 'postablePosts',
    variables: {
      ...variables,
      order
    }
  };

  const { paginatorProps, items: postablePosts, loading, refetch, updateQuery } = usePaginator({
    summaryQuery, itemsQuery
  });

  useImperativeHandle(ref, () => ({
    addNewPost: (newPost) => {
      updateQuery(prev => ({
        postablePosts: [
          ...(prev.postablePosts || [] ),
          newPost
        ]
      }));
    }
  }));

  return (
    <Section className="postable" data-cy="postable" loading={loading}>
      {!(_.isEmpty(postablePosts)) && (
        <>
          <SortOptionsBar
            order={order}
            visible={_.get(postablePosts, 'length', 0) > 1}
            entityName={entityName}
            extraOptionsLast={extraSortOptions}
            onChange={setOrder}
          />

          <Transition.Group>
            {_.map(postablePosts, post => (
              <Segment key={`post-${post.id}`}>
                <PostSummary
                  post={post}
                  canAdmin={canAdmin}
                  canEdit={currentUser?.id === post.userId}
                  showContext={showContext}
                />
              </Segment>
            ))}
          </Transition.Group>
        </>
      )}

      <NoPostsYet
        visible={!loading && _.isEmpty(postablePosts)}
        canPost={canPost}
      />

      {canPost && !(currentUser) && <LoginToCreatePostCTA onLoggedIn={refetch} cta="Create a Post" />}

      <UberPaginator {...paginatorProps} />
    </Section>
  );
}

export default forwardRef(Posts);

Posts.defaultProps = {
  canPost: false,
  canAdmin: false,
  extraSortOptions: false,
  showContext: false,
  initialSortOrder: false
};

Posts.propTypes = {
  postableId: PropTypes.string.isRequired,
  postableType: PropTypes.string.isRequired,
  entityName: PropTypes.string.isRequired,
  canPost: PropTypes.bool,
  canAdmin: PropTypes.bool,
  showContext: PropTypes.bool,
  extraSortOptions: PropTypes.object,
  initialSortOrder: PropTypes.object
};

function NoPostsYet({ visible, canPost }) {
  return visible && (
    <Message icon>
      <Message.Content>
        <Message.Header>No posts yet</Message.Header>
        {canPost && <p>Be the the first to create a Post.</p>}
      </Message.Content>
    </Message>
  );
}

NoPostsYet.defaultProps = {
  visible: false,
  canPost: false
};

NoPostsYet.propTypes = {
  visible: PropTypes.bool,
  canPost: PropTypes.bool
};
