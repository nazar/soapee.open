import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { Segment, Transition, Message } from 'semantic-ui-react';

import usePaginator from 'hooks/usePaginator';

import Comment from 'components/shared/Commentable/components/Comment';
import Section from 'components/shared/Section';
import SortOptionsBar, { defaultOrder } from 'components/shared/SortOptionsBar';
import UberPaginator from 'components/shared/UberPaginator';


import commentsSummaryQuery from './queries/commentsSummary.gql';
import commentsQuery from './queries/comments.gql';

export default function Comments() {
  const { profileId } = useParams();
  const [order, setOrder] = useState(defaultOrder);

  const variables = {
    search: {
      userId: profileId
    }
  };

  const summaryQuery = {
    query: commentsSummaryQuery,
    dataKey: 'commentsSummary',
    variables
  };

  const itemsQuery = {
    query: commentsQuery,
    dataKey: 'comments',
    variables: {
      ...variables,
      order
    }
  };

  const { paginatorProps, items: comments, loading } = usePaginator({
    summaryQuery, itemsQuery
  });

  return (
    <Section basic loading={loading} className="posts">
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
                <Comment showContext comment={comment} />
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
    <Message
      icon="comment"
      header="No results"
      content="I haven't posted any comments yet."
    />
  );
}

NoCommentYet.defaultProps = {
  visible: false
};

NoCommentYet.propTypes = {
  visible: PropTypes.bool
};
