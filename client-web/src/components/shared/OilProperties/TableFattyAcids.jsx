import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'semantic-ui-react';

import oilProperties, { fattyAcids } from 'services/oilProperties';

import HeaderRow from './HeaderRow';


export default function TableFattyAcids({ oil }) {
  const properties = oil && oilProperties(oil);

  return (
    <Table celled compact striped unstackable data-cy="fatty-acids">
      <Table.Header>
        <HeaderRow caption="Fatty Acids" />
      </Table.Header>

      <Table.Body>
        <Breakdowns oil={oil} />
      </Table.Body>

      <Table.Header>
        <HeaderRow caption="Breakdowns" />
      </Table.Header>

      <Table.Body>
        <Saturations properties={properties} />
      </Table.Body>

      <Table.Header>
        <HeaderRow caption="Ratios" />
      </Table.Header>

      <Table.Body>
        <Ratios properties={properties} />
      </Table.Body>
    </Table>
  );
}

TableFattyAcids.propTypes = {
  oil: PropTypes.object.isRequired
};

function Breakdowns({ oil }) {
  const breakdowns = _.chain(fattyAcids)
    .map(fattyAcid => ({
      label: _.capitalize(fattyAcid),
      breakdown: _.get(oil, ['breakdown', fattyAcid])
    }))
    .filter(f => f.breakdown)
    .value();

  return _.map(breakdowns, ({ label, breakdown }) => (
    <Table.Row key={`breakdown-${label}`} data-cy="breakdown-row">
      <Table.Cell>
        <strong>{label}</strong>
      </Table.Cell>
      <Table.Cell>{breakdown}%</Table.Cell>
    </Table.Row>
  ));
}

function Saturations({ properties }) {
  const labels = {
    saturated: 'Saturated',
    monoSaturated: 'Mono-unsaturated',
    polySaturated: 'Poly-unsaturated'
  };

  return _(properties)
    .chain()
    .get('saturation')
    .pick('saturated', 'monoSaturated', 'polySaturated')
    .map((satType, saturation) => {
      return (
        // eslint-disable-next-line react/no-array-index-key
        <Table.Row key={`saturation-${saturation}`} data-cy="saturation-row">
          <Table.Cell>
            <strong>{labels[saturation]}</strong>
          </Table.Cell>
          <Table.Cell>{satType}%</Table.Cell>
        </Table.Row>
      );
    })
    .value();
}

function Ratios({ properties }) {
  const saturated = _.get(properties, 'saturation.saturated', 0);
  const ratios = `${saturated} : ${100 - saturated}`;

  return (
    <Table.Row data-cy="ratio-row">
      <Table.Cell>
        <strong>Saturation Ratio</strong>
      </Table.Cell>
      <Table.Cell>{ratios}</Table.Cell>
    </Table.Row>
  );
}

Ratios.propTypes = {
  properties: PropTypes.object.isRequired
};
