import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Header, Icon, Table, Message } from 'semantic-ui-react';

import usePaginator from 'hooks/usePaginator';

import Group from 'components/shared/Group';
import Section from 'components/shared/Section';
import SortOptionsBar from 'components/shared/SortOptionsBar';
import UberPaginator from 'components/shared/UberPaginator';

import myAdditivesQuery from './queries/myAdditives.gql';
import myAdditivesSummaryQuery from './queries/myAdditivesSummary.gql';

import './style.styl';

export default function AdditivesList() {
  const [order, setOrder] = useState(sortOptionNameAsc);

  const summaryQuery = {
    query: myAdditivesSummaryQuery,
    dataKey: 'additivesSummary'
  };

  const itemsQuery = {
    query: myAdditivesQuery,
    dataKey: 'additives',
    variables: {
      order
    }
  };

  const { paginatorProps, items: additives, loading } = usePaginator({
    summaryQuery, itemsQuery
  });

  const hasAdditives = !(loading) && additives?.length > 0;

  return (
    <Section id="root-additives-list" loading={loading}>
      <Group className="additives-header"  align="center">
        <Header as="h2">My Additives</Header>
        <div className="btn-container">
          <Button primary  as={Link} to="/settings/additives/create" data-cy="add-additive">
            Add a new Additive
          </Button>
        </div>
      </Group>

      {hasAdditives && (
        <SortOptionsBar
          replacementOptions={replacementOptions}
          order={order}
          visible={_.get(additives, 'length', 0) > 1}
          onChange={setOrder}
        />
      )}

      {hasAdditives && (
        <Table sortable celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Additive</Table.HeaderCell>
              <Table.HeaderCell collapsing>Usages</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {_.map(additives, (additive) => (
              <Table.Row key={additive.id} data-cy="my-additive-row">
                <Table.Cell>
                  <Link to={`/settings/additives/${additive.id}`}>{additive.name}</Link>
                </Table.Cell>
                <Table.Cell>{additive.stats?.recipes?.count || '0'}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <NoAdditivesYet visible={!(hasAdditives)} />

      <UberPaginator {...paginatorProps} />
    </Section>
  );
}

function NoAdditivesYet({ visible }) {
  return visible && (
    <Message info icon>
      <Icon name="add" />
      <Message.Content>
        <Message.Header>I haven&apos;t added any additives yet.</Message.Header>
        <p>
          <Link to="/settings/additives/create"><strong>Create</strong></Link> your first additive.
        </p>
      </Message.Content>
    </Message>
  );
}

NoAdditivesYet.defaultProps = {
  visible: false
};

NoAdditivesYet.propTypes = {
  visible: PropTypes.bool
};

const sortOptionNameAsc = { field: 'name', direction: 'asc' };

export const replacementOptions = [
  { value: sortOptionNameAsc, text: 'Name ascending', key: 1 },
  { value: { field: 'name', direction: 'desc' }, text: 'Name descending', key: 2 },
  { value: { field: 'createdAt', direction: 'asc' }, text: 'Newest first', key: 3 },
  { value: { field: 'createdAt', direction: 'desc' }, text: 'Oldest first', key: 4 },
  { value: { field: 'recipeCount', direction: 'desc' }, text: 'Most used', key: 5 },
  { value: { field: 'recipeCount', direction: 'asc' }, text: 'Least used', key: 6 }
];
