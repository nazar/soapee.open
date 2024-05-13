import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'semantic-ui-react';

import { sapForNaOh } from 'services/oilProperties';

import HeaderRow from './HeaderRow';


export default function TableSapValues({ oil }) {
  return (
    <Table unstackable celled compact striped>
      <Table.Header>
        <HeaderRow caption="Saponification Values" />
      </Table.Header>

      <Table.Body>
        <SapRows oil={oil} />
      </Table.Body>
    </Table>
  );
}

TableSapValues.propTypes = {
  oil: PropTypes.object.isRequired
};

function SapRows({ oil }) {
  return (
    <>
      <Table.Row>
        <Table.Cell>
          <strong>KOH</strong>
        </Table.Cell>
        <Table.Cell>{_.get(oil, 'sap')}</Table.Cell>
      </Table.Row>

      <Table.Row>
        <Table.Cell>
          <strong>NaOH</strong>
        </Table.Cell>
        <Table.Cell>{sapForNaOh(oil)}</Table.Cell>
      </Table.Row>
    </>
  );
}

SapRows.propTypes = {
  oil: PropTypes.object.isRequired
};
