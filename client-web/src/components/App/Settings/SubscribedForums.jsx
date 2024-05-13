import React from 'react';
import { Header, Message } from 'semantic-ui-react';

import ForumsPagingTable from 'components/shared/Forums/ForumsPagingTable';

import mySubscribedForumsQuery from './queries/mySubscribedForums.gql';
import mySubscribedForumsSummaryQuery from './queries/mySubscribedForumsSummary.gql';

export default function Forums() {
  const summaryQuery = {
    query: mySubscribedForumsSummaryQuery,
    dataKey: 'mySubscribedForumsSummary'
  };

  const itemsQuery = {
    query: mySubscribedForumsQuery,
    dataKey: 'mySubscribedForums',
    variables: {
      order: {
        field: 'name',
        direction: 'asc'
      }
    }
  };


  return (
    <>
      <Header as="h2">My Subscribed Forums</Header>

      <ForumsPagingTable
        summaryQuery={summaryQuery}
        itemsQuery={itemsQuery}
        emptyContent={<IHaventSubscribedToAnyForumsYet />}
      />
    </>
  );
}

function IHaventSubscribedToAnyForumsYet(prop) {
  return (
    <Message
      icon="comments outline"
      header="No Results"
      content="You haven't subscribed to any Forums yet"
      {...prop}
    />
  );
}
