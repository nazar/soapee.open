import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Header, Segment, Transition, Message } from 'semantic-ui-react';

import usePaginator from 'hooks/usePaginator';

import PostSummary from 'components/shared/Postable/components/PostSummary';
import Section from 'components/shared/Section';
import SortOptionsBar, { newestFirstOrder } from 'components/shared/SortOptionsBar';
import UberPaginator from 'components/shared/UberPaginator';

import myFavouritePostsQuery from '../queries/myFavouritePosts.gql';
import myFavouritePostsSummaryQuery from '../queries/myFavouritePostsSummary.gql';

export default function FavouritePosts() {
  const [order, setOrder] = useState(newestFirstOrder);

  const summaryQuery = {
    query: myFavouritePostsSummaryQuery,
    dataKey: 'myFavouritePostsSummary'
  };

  const itemsQuery = {
    query: myFavouritePostsQuery,
    dataKey: 'myFavouritePosts',
    variables: {
      order
    }
  };

  const { paginatorProps, items: postablePosts, loading } = usePaginator({
    summaryQuery, itemsQuery
  });

  const hasPosts = !(_.isEmpty(postablePosts));

  return (
    <Section basic loading={loading} className="posts">
      <Header as="h2">My Favourite Posts</Header>

      {hasPosts && (
        <>
          <SortOptionsBar
            order={order}
            visible={_.get(postablePosts, 'length', 0) > 1}
            onChange={setOrder}
          />

          <Transition.Group>
            {_.map(postablePosts, post => (
              <Segment key={`post-${post.id}`}>
                <PostSummary showContext post={post} />
              </Segment>
            ))}
          </Transition.Group>
        </>
      )}

      <NoPostsYet visible={!loading && !(hasPosts)} />

      <UberPaginator {...paginatorProps} />
    </Section>
  );
}

function NoPostsYet({ visible }) {
  return visible && (
    <Message info>
      <Message.Header>I haven&apos;t favourited any posts yet.</Message.Header>
    </Message>
  );
}

NoPostsYet.defaultProps = {
  visible: false
};

NoPostsYet.propTypes = {
  visible: PropTypes.bool
};
