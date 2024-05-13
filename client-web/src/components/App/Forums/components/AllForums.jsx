import _ from 'lodash';
import React, { useState } from 'react';
import { Table, Segment } from 'semantic-ui-react';

import usePaginator from 'hooks/usePaginator';

import Section from 'components/shared/Section';
import UberPaginator from 'components/shared/UberPaginator';
import ForumSummaryRow from 'components/shared/Forums/ForumSummaryRow';

import forumsQuery from 'components/shared/Forums/queries/forums.gql';
import forumsSummaryQuery from 'components/shared/Forums/queries/forumsSumary.gql';

import MessageNoForums from './MessageNoForums';

import ForumsSortOptionsBar from './ForumsSortOptionsBar';


export default function AllForums() {
  const [order, setOrder] = useState({ field: 'name', direction: 'asc' });

  const summaryQuery = {
    query: forumsSummaryQuery,
    dataKey: 'forumsSummary',
    variables: {
      search: {
        official: false
      }
    }
  };

  const itemsQuery = {
    query: forumsQuery,
    dataKey: 'forums',
    variables: {
      search: {
        official: false
      },
      order
    }
  };

  const { paginatorProps, items: forums, loading } = usePaginator({
    summaryQuery, itemsQuery
  });

  if (!(_.isEmpty(forums))) {
    return (
      <>
        <Segment>
          <ForumsSortOptionsBar
            order={order}
            onChange={setOrder}
          />
        </Segment>

        <Section shadow loading={loading} className="forums" data-cy="all-forums">
          <Table className="forums-table" celled>
            <Table.Body>
              {_.map(forums, forum => <ForumSummaryRow forum={forum} key={`forum-summary-row-${forum.id}`} />)}
            </Table.Body>
          </Table>
        </Section>

        <UberPaginator {...paginatorProps} />
      </>
    );
  } else {
    return <MessageNoForums />;
  }
}
