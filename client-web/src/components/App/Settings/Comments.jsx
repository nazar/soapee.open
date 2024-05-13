import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Header, Segment, Transition, Message } from 'semantic-ui-react';

import usePaginator from 'hooks/usePaginator';

import Comment from 'components/shared/Commentable/components/Comment';
import Section from 'components/shared/Section';
import SortOptionsBar, { newestFirstOrder } from 'components/shared/SortOptionsBar';
import UberPaginator from 'components/shared/UberPaginator';

import myCommentsQuery from './queries/myComments.gql';
import myCommentsSummaryQuery from './queries/myCommentsSummary.gql';

export default function Comments() {
  const [order, setOrder] = useState(newestFirstOrder);

  const summaryQuery = {
    query: myCommentsSummaryQuery,
    dataKey: 'myCommentsSummary'
  };

  const itemsQuery = {
    query: myCommentsQuery,
    dataKey: 'myComments',
    variables: {
      order
    }
  };

  const { paginatorProps, items: comments, loading } = usePaginator({
    summaryQuery, itemsQuery
  });

  return (
    <Section basic loading={loading} className="posts">
      <Header as="h2">My Comments</Header>

      {!(_.isEmpty(comments)) && (
        <>
          <SortOptionsBar
            order={order}
            visible={_.get(comments, 'length', 0) > 1}
            onChange={setOrder}
          />

          <Transition.Group>
            {_.map(comments, comment => (
              <Segment key={`comment-${comment.id}`}>
                <Comment showContext canReport={false} comment={comment} />
              </Segment>
            ))}
          </Transition.Group>
        </>
      )}

      <NoCommentYet visible={!loading && _.isEmpty(comments)} />

      <UberPaginator {...paginatorProps} />
    </Section>
  );
}

function NoCommentYet({ visible }) {
  return visible && (
    <Message info>
      <Message.Header>I haven&apos;t posted any comments yet.</Message.Header>
    </Message>
  );
}

NoCommentYet.defaultProps = {
  visible: false
};

NoCommentYet.propTypes = {
  visible: PropTypes.bool
};
