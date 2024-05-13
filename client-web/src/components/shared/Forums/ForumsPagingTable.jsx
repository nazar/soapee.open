import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'semantic-ui-react';

import usePaginator from 'hooks/usePaginator';
import Section from 'components/shared/Section';
import UberPaginator from 'components/shared/UberPaginator';

import ForumSummaryRow from './ForumSummaryRow';

export default function ForumsPagingTable({ summaryQuery, itemsQuery, emptyContent, 'data-cy': dataCy }) {
  const { paginatorProps, items: forums, loading } = usePaginator({
    summaryQuery, itemsQuery
  });

  const hasForums = !(_.isEmpty(forums));

  return (
    <Section shadow loading={loading} className="forums" data-cy={dataCy}>
      {!(loading) && hasForums && (
        <Table className="forums-table" celled>
          <Table.Body>
            {_.map(forums, forum => <ForumSummaryRow forum={forum} key={`forum-summary-row-${forum.id}`} />)}
          </Table.Body>
        </Table>
      )}

      {!(loading) && !(hasForums) && (
        emptyContent
      )}

      <UberPaginator {...paginatorProps} />
    </Section>
  );
}

ForumsPagingTable.defaultProps = {
  'data-cy': null
};

ForumsPagingTable.propTypes = {
  summaryQuery: PropTypes.object.isRequired,
  itemsQuery: PropTypes.object.isRequired,
  emptyContent: PropTypes.node.isRequired,
  'data-cy': PropTypes.string
};
