import React from 'react';
import { Header, Dropdown, Segment } from 'semantic-ui-react';
import { useCreation } from 'ahooks';

export default function SortOptionsBar({
  order,
  visible,
  extraOptionsLast,
  extraOptionsFirst,
  replacementOptions,
  entityName = '',
  onChange
}) {
  const options = useCreation(() => {
    if (replacementOptions) {
      return replacementOptions;
    } else {
      const options = [
        { value: { field: 'createdAt', direction: 'desc' }, text: 'Newest first', key: 10 },
        { value: { field: 'createdAt', direction: 'asc' }, text: 'Oldest first', key: 20 },
        { value: { field: 'score', direction: 'desc' }, text: 'Highest rated', key: 30 }
      ];

      return [
        ...(extraOptionsFirst || []),
        ...options,
        ...(extraOptionsLast || [])
      ];
    }
  }, [extraOptionsFirst, extraOptionsLast, replacementOptions]);

  return (visible && (
    <Segment data-cy="sort-order-bar">
      <Header as="h5">
        <Header.Content>
          Sort {entityName} by{' '}
          <Dropdown
            inline
            header="Select sorting options"
            options={options}
            defaultValue={order}
            data-cy="dropdown"
            onChange={handle}
          />
        </Header.Content>
      </Header>
    </Segment>
  )) || null;

  function handle(e, { value }) {
    onChange(value);
  }
}

export const defaultOrder = { field: 'createdAt', direction: 'asc' };
export const newestFirstOrder = { field: 'createdAt', direction: 'desc' };
