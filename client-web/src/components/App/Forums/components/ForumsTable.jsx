import _ from 'lodash';
import React from 'react';
import { Table } from 'semantic-ui-react';

import ForumSummaryRow from 'components/shared/Forums/ForumSummaryRow';

import MessageNoForums from './MessageNoForums';


export default function ForumsTable({ forums, skipCreate }) {
  if (forums && forums.length) {
    return (
      <Table className="forums-table" celled>
        <Table.Body>
          {_.map(forums, forum => <ForumSummaryRow forum={forum} key={`forum-summary-row-${forum.id}`} />)}
        </Table.Body>
      </Table>
    );
  } else if (!(skipCreate)) {
    return <MessageNoForums />;
  } else {
    return null;
  }
}
