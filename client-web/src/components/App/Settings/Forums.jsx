import React from 'react';
import { Header, Message } from 'semantic-ui-react';

import ForumsPagingTable from 'components/shared/Forums/ForumsPagingTable';

import myForumsQuery from './queries/myForums.gql';
import myForumsSummaryQuery from './queries/myForumsSummary.gql';

export default function Forums() {
  const summaryQuery = {
    query: myForumsSummaryQuery,
    dataKey: 'myForumsSummary'
  };

  const itemsQuery = {
    query: myForumsQuery,
    dataKey: 'myForums',
    variables: {
      order: {
        field: 'name',
        direction: 'asc'
      }
    }
  };


  return (
    <>
      <Header as="h2">My Forums</Header>

      <ForumsPagingTable
        summaryQuery={summaryQuery}
        itemsQuery={itemsQuery}
        emptyContent={<IHaventCreatedAnyForumsYet />}
      />
    </>
  );
}

function IHaventCreatedAnyForumsYet(prop) {
  return (
    <Message
      icon="comments outline"
      header="No Results"
      content="I haven't created any forums yet..."
      {...prop}
    />
  );
}
