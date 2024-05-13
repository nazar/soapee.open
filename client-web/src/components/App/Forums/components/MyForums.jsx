import React from 'react';
import { Link } from 'react-router-dom';
import { Message } from 'semantic-ui-react';

import ForumsPagingTable from 'components/shared/Forums/ForumsPagingTable';

import forumsQuery from 'components/shared/Forums/queries/forums.gql';
import forumsSummaryQuery from 'components/shared/Forums/queries/forumsSumary.gql';

export default function MyForums() {
  const summaryQuery = {
    query: forumsSummaryQuery,
    dataKey: 'forumsSummary',
    variables: {
      search: {
        mine: true,
        official: false
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
        mine: true,
        official: false
      }
    }
  };


  return (
    <ForumsPagingTable
      summaryQuery={summaryQuery}
      itemsQuery={itemsQuery}
      emptyContent={<Cta />}
      data-cy="my-forums"
    />
  );

  function Cta(props) {
    return (
      <Message
        icon="comments outline"
        header="No Results"
        content={<Content />}
        {...props}
      />
    );

    function Content(props2) {
      return (
        <div {...props2}>
          You don&apos;t own any forums yet. <Link to="/forums/create">Create</Link> your own Community.
        </div>
      );
    }
  }
}
