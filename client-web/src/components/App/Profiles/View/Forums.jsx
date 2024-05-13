import React from 'react';
import { Message } from 'semantic-ui-react';
import { useParams } from 'react-router-dom';

import ForumsPagingTable from 'components/shared/Forums/ForumsPagingTable';

import forumsQuery from 'components/shared/Forums/queries/forums.gql';
import forumsSummaryQuery from 'components/shared/Forums/queries/forumsSumary.gql';

export default function MySubscribedForums() {
  const { profileId } = useParams();

  const summaryQuery = {
    query: forumsSummaryQuery,
    dataKey: 'forumsSummary',
    variables: {
      search: {
        userId: profileId
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
        userId: profileId
      }
    }
  };

  return (
    <ForumsPagingTable
      summaryQuery={summaryQuery}
      itemsQuery={itemsQuery}
      emptyContent={<IHaventCreatedAnyForumsYet />}
    />
  );
}

function IHaventCreatedAnyForumsYet() {
  return (
    <Message
      icon="comments outline"
      header="No Results"
      content="I haven't created any forums yet..."
    />
  );
}
