import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'semantic-ui-react';
import { useCreation } from 'ahooks';

import oilProperties from 'services/oilProperties';

import HeaderRow from './HeaderRow';


export default function TableProperties({ oil }) {
  const properties = oil && oilProperties(oil);

  return (
    <Table unstackable celled compact striped data-cy="oil-properties">
      <Table.Header>
        <HeaderRow caption="Oil Properties" />
      </Table.Header>

      <Table.Body>
        <PropertyRows properties={properties} />
      </Table.Body>
    </Table>
  );
}

TableProperties.defaultProps = {
  oil: null
};

TableProperties.propTypes = {
  oil: PropTypes.object
};

function PropertyRows({ properties }) {
  const props = useCreation(() => _.chain(properties)
    .get('properties')
    .keys()
    .sort()
    .value(), [properties]);

  return _.map(props, property => (
    <Table.Row key={`property-${property}`} data-cy="oil-property">
      <Table.Cell>
        <strong>{_.capitalize(property)}</strong>
      </Table.Cell>
      <Table.Cell>{properties.properties[property]} %</Table.Cell>
    </Table.Row>
  ));
}
