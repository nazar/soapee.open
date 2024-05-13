import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Message, Table } from 'semantic-ui-react';
import { useCreation } from 'ahooks';

import client from 'client';
import useEventDataValue from 'hooks/useEventDataValue';

import LinkText from 'components/shared/LinkText';
import TooltipQuestion from 'components/shared/TooltipQuestion';

import createAdditiveMutation from './queries/createAdditive.gql';

import './style.styl';

export default function ListAdditivesSelector({ additives, onAddedAdditive, onRefresh }) {
  const [additiveFilter, setAdditiveFilter, setAdditiveValue] = useEventDataValue('');

  const filteredAdditives = useCreation(() => _.chain(additives)
      .filter(additive => (additiveFilter ? additive.name.toUpperCase().match(additiveFilter.toUpperCase()) : additive))
      .orderBy(({ name }) => _.toLower(name))
      .value()
    , [additiveFilter, additives]);

  return (
    <div className="list-additives-selector" data-cy="list-additives-selector">
      <Input
        fluid
        value={additiveFilter}
        placeholder="Filter Additives..."
        icon="search"
        data-cy="additive-input-filter"
        onChange={setAdditiveFilter}
      />

      {!(_.isEmpty(filteredAdditives)) && (
        <Table unstackable selectable striped compact className="list-additives-selector" data-cy="list-additives-selector">
          <Table.Body>
            {_.map(filteredAdditives, additive => (
              <Additive
                key={`add-${additive.id}`}
                additive={additive}
                onAdd={onAddedAdditive}
              />
            ))}
          </Table.Body>
        </Table>
      )}

      {_.isEmpty(filteredAdditives) && _.isEmpty(additiveFilter) && (
        <NoAdditivesCTA />
      )}

      {_.isEmpty(filteredAdditives) && !(_.isEmpty(additiveFilter)) && (
        <NoAdditivesFoundCTA
          name={additiveFilter}
          onCreate={handleCreateAdditive}
        />
      )}
    </div>
  );

  function handleCreateAdditive(name) {
    return client
      .mutate({
        mutation: createAdditiveMutation,
        variables: { input: { name } }
      })
      .then(() => {
        setAdditiveValue('');
        return onRefresh();
      });
  }
}

ListAdditivesSelector.defaultProps = {
  additives: null
};

ListAdditivesSelector.propTypes = {
  additives: PropTypes.array,
  onAddedAdditive: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired
};

function Additive({ additive, onAdd }) {
  return (
    <Table.Row data-cy="additive-select-row">
      <Table.Cell selectable>
        <a
          className="additive-cell"
          role="link"
          tabIndex={0}
          onDoubleClick={handleOnAdd}
        >
          {additive.name}
        </a>
      </Table.Cell>

      <Table.Cell collapsing>
        {additive.notes && (
          <TooltipQuestion basic position="left center">
            <div dangerouslySetInnerHTML={{ __html: additive.notes }} />
          </TooltipQuestion>
        )}

        {!(additive.notes) && <span>&nbsp;</span>}
      </Table.Cell>

      <Table.Cell collapsing>
        <Button
          primary
          type="button"
          icon="add"
          size="mini"
          className="add-additive"
          data-cy="add-additive"
          onClick={handleOnAdd}
        />
      </Table.Cell>
    </Table.Row>
  );

  function handleOnAdd() {
    onAdd(additive);
  }
}

Additive.propTypes = {
  additive: PropTypes.object.isRequired,
  onAdd: PropTypes.func.isRequired
};

function NoAdditivesCTA() {
  return (
    <Message>
      <Message.Content>
        <Message.Header>No Additives</Message.Header>
        Your Additives list is empty.
        <br />
        Type a new Additive name in the filter to create it.
      </Message.Content>
    </Message>
  );
}

function NoAdditivesFoundCTA({ name, onCreate }) {
  return (
    <Message>
      <Message.Content>
        <Message.Header>Additive not found</Message.Header>
        Could not found additive {name}
        <br />
        Click <LinkText content={`here to create ${name}`} data-cy="create-additive" onClick={handleCreate} />.
      </Message.Content>
    </Message>
  );

  function handleCreate() {
    onCreate(name);
  }
}

NoAdditivesFoundCTA.propTypes = {
  name: PropTypes.string.isRequired,
  onCreate: PropTypes.func.isRequired
};
