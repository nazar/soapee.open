import React from 'react';
import PropTypes from 'prop-types';
import { Header, Dropdown } from 'semantic-ui-react';

export default function ForumsSortOptionsBar({ order, onChange }) {
  const options = [
    { value: { field: 'createdAt', direction: 'desc' }, text: 'Newest first', key: 1 },
    { value: { field: 'createdAt', direction: 'asc' }, text: 'Oldest first', key: 2 },
    { value: { field: 'name', direction: 'asc' }, text: 'Name ascending', key: 3 },
    { value: { field: 'name', direction: 'desc' }, text: 'Name descending', key: 4 },
    { value: { field: 'popular', direction: 'asc' }, text: 'Most Popular first', key: 5 },
    { value: { field: 'popular', direction: 'desc' }, text: 'Least Popular first', key: 6 }
  ];

  return (
    <Header as="h5">
      <Header.Content>
        Sort by{' '}
        <Dropdown
          inline
          header="Select sorting options"
          options={options}
          defaultValue={order}
          onChange={handle}
        />
      </Header.Content>
    </Header>
  );

  function handle(e, { value }) {
    onChange(value);
  }
}

ForumsSortOptionsBar.propTypes = {
  order: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};
