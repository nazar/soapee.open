import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'semantic-ui-react';

export default function HeaderRow({ caption }) {
  return (
    <Table.Row>
      <Table.HeaderCell colSpan="2">{caption}</Table.HeaderCell>
    </Table.Row>
  );
}

HeaderRow.propTypes = {
  caption: PropTypes.string.isRequired
};
