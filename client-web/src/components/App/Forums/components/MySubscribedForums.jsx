import React from 'react';
import { Message } from 'semantic-ui-react';

import ForumsPagingTable from 'components/shared/Forums/ForumsPagingTable';

import forumsQuery from 'components/shared/Forums/queries/forums.gql';
import forumsSummaryQuery from 'components/shared/Forums/queries/forumsSumary.gql';

export default function MySubscribedForums() {
  const summaryQuery = {
    query: forumsSummaryQuery,
    dataKey: 'forumsSummary',
    variables: {
      search: {
        subscribed: true
      }
    }
  };

  const itemsQuery = {
    query: forumsQuery,
    dataKey: 'forums',
    variables: {
      order: {
        field: 'name',
        direction: 'asc'
      },
      search: {
        subscribed: true
      }
    }
  };


  return (
    <ForumsPagingTable
      summaryQuery={summaryQuery}
      itemsQuery={itemsQuery}
      emptyContent={<NoSubscriptions />}
      data-cy="subscribed-forums"
    />
  );

  function NoSubscriptions(prop) {
    return (
      <Message
        icon="comments outline"
        header="No Results"
        content="You are not subscribed to any User forums"
        {...prop}
      />
    );
  }
}
