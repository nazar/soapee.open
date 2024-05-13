import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Segment, Transition, Message } from 'semantic-ui-react';
import { useParams } from 'react-router-dom';

import useCurrentUser from 'hooks/useCurrentUser';
import usePaginator from 'hooks/usePaginator';

import PostSummary from 'components/shared/Postable/components/PostSummary';
import Section from 'components/shared/Section';
import SortOptionsBar, { defaultOrder } from 'components/shared/SortOptionsBar';
import UberPaginator from 'components/shared/UberPaginator';


import postsSummaryQuery from './queries/postsSummary.gql';
import postsQuery from './queries/posts.gql';

export default function Posts() {
  const { profileId } = useParams();
  const [order, setOrder] = useState(defaultOrder);
  const currentUser = useCurrentUser();

  const canAdmin = Number(profileId) === _.chain(currentUser).get('id').toNumber().value();

  const variables = {
    search: {
      userId: profileId
    }
  };

  const summaryQuery = {
    query: postsSummaryQuery,
    dataKey: 'postsSummary',
    variables
  };

  const itemsQuery = {
    query: postsQuery,
    dataKey: 'posts',
    variables: {
      ...variables,
      order
    }
  };

  const { paginatorProps, items: postablePosts, loading } = usePaginator({
    summaryQuery, itemsQuery
  });

  return (
    <Section basic loading={loading} className="posts">
      {(postablePosts || []).length > 0 && (
        <>
          <SortOptionsBar
            order={order}
            visible={_.get(postablePosts, 'length', 0) > 1}
            onChange={setOrder}
          />

          <Transition.Group>
            {_.map(postablePosts, post => (
              <Segment key={`post-${post.id}`}>
                <PostSummary showContext post={post} canAdmin={canAdmin} />
              </Segment>
            ))}
          </Transition.Group>
        </>
      )}

      <NoPostsYet visible={!loading && _.isEmpty(postablePosts)} />

      <UberPaginator {...paginatorProps} />
    </Section>
  );
}

function NoPostsYet({ visible }) {
  return visible && (
    <Message
      icon="wordpress forms"
      header="No Results"
      content="I haven't made any posts yet."
    />
  );
}

NoPostsYet.defaultProps = {
  visible: false
};

NoPostsYet.propTypes = {
  visible: PropTypes.bool
};
