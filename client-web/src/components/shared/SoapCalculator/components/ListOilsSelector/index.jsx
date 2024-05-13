import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Table } from 'semantic-ui-react';
import { useCreation } from 'ahooks';

import useEventDataValue from 'hooks/useEventDataValue';
import TooltipQuestion from 'components/shared/TooltipQuestion';

import PropertiesOil from '../PropertiesOil';

import './listOilsSelector.styl';


export default function ListOilsSelector({ oils, onAddedOil }) {
  const [oilFilter, setOilFilter] = useEventDataValue('');

  const filteredOils = useCreation(() => _.chain(oils)
      .filter(oil => (oilFilter ? oil.name.toUpperCase().match(oilFilter.toUpperCase()) : oil))
      .orderBy('name')
      .value()
    , [oilFilter, oils]);

  return (
    <div className="list-oils-selector">
      <Input
        key="oil-input-filter"
        fluid
        value={oilFilter}
        placeholder="Filter Oils..."
        icon="search"
        data-cy="oil-input-filter"
        onChange={setOilFilter}
      />

      <Table unstackable selectable striped compact className="list-oils-selector">
        <Table.Body>
          {_.map(filteredOils, oil => (
            <Oil
              key={`oil-${oil.id}`}
              oil={oil}
              onAdd={onAddedOil}
            />
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}

ListOilsSelector.defaultProps = {
  oils: null
};

ListOilsSelector.propTypes = {
  oils: PropTypes.array,
  onAddedOil: PropTypes.func.isRequired
};

function Oil({ oil, onAdd }) {
  return (
    <Table.Row>
      <Table.Cell selectable>
        <a
          className="oil-cell"
          role="link"
          tabIndex={0}
          onDoubleClick={handleOnAdd}
        >
          {oil.name}
        </a>
      </Table.Cell>

      <Table.Cell collapsing>
        <TooltipQuestion basic position="left center">
          <PropertiesOil oil={oil} />
        </TooltipQuestion>
      </Table.Cell>

      <Table.Cell collapsing>
        <Button
          primary
          type="button"
          icon="add"
          size="mini"
          className="add-oil"
          onClick={handleOnAdd}
        />
      </Table.Cell>
    </Table.Row>
  );

  function handleOnAdd() {
    onAdd(oil);
  }
}

Oil.propTypes = {
  oil: PropTypes.object.isRequired,
  onAdd: PropTypes.func.isRequired
};
