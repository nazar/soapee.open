import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Segment, Table, Icon, Input } from 'semantic-ui-react';
import { useCreation, useKeyPress } from 'ahooks';
import cx from 'clsx';

import useEventTargetValue from 'hooks/useEventTargetValue';
import useMedia, { tabletUp } from 'hooks/useMedia';
import oilProperties from 'services/oilProperties';

import './style.styl';


export default function OilGrid({ oils }) {
  const [gridColumns, setGridColumns] = useState('fats-common');
  const [oilFilter, handleOilFilter, setOilFilter] = useEventTargetValue('');

  const data = useCreation(() => {
    const oilProps = getFlatOilProperties(oils);

    if (oilFilter) {
      const cased = _.toLower(oilFilter);

      return _.filter(oilProps, (oil) => _.toLower(oil.name).match(cased));
    } else {
      return oilProps;
    }
  }, [oils, oilFilter]);

  useKeyPress('esc', () => setOilFilter(''));

  return (
    <div className="grid-oils" data-cy="grid-oils">
      <Segment>
        <ColumnButtons
          gridColumns={gridColumns}
          onChangeGridColumns={setGridColumns}
        />
      </Segment>

      <Segment data-cy="filter-oils">
        <Input icon placeholder='Filter Oils...' className="filter-input">
          <input value={oilFilter} onChange={handleOilFilter} />
          <Icon name='search' />
        </Input>
      </Segment>

      <OilTable
        oils={data}
        columns={getViewColumns()}
      />
    </div>
  );

  // helper functions

  function getViewColumns() {
    const columns = oilPropertyGroupings();
    const cellTransforms = getCellTransforms();

    return _.map(columns[gridColumns], (column) => {
      const Cell = _.get(cellTransforms, [column, 'customComponent']);
      const displayName = _.get(cellTransforms, [column, 'displayName']);

      return {
        header: displayName || _.capitalize(column),
        accessor: column,
        Cell
      };
    });

    function getCellTransforms() {
      return {
        name: {
          customComponent: OilLinkColumn
        },
        monoSaturated: {
          displayName: 'Mono-unsaturated %'
        },
        polySaturated: {
          displayName: 'Poly-unsaturated %'
        }
      };
    }

    function OilLinkColumn(oil) {
      return <Link to={`/oils/${oil.id}`}>{oil.name}</Link>;
    }
  }
}

OilGrid.defaultProps = {
  oils: null
};

OilGrid.propTypes = {
  oils: PropTypes.array
};

function ColumnButtons({ gridColumns, onChangeGridColumns }) {
  const isTabletUp = useMedia(tabletUp);

  const groupProps = {
    vertical: !(isTabletUp),
    fluid: !(isTabletUp)
  };

  return (
    <Button.Group {...groupProps}>
      <Button
        className={activeClass('properties')}
        size="mini"
        content="Properties"
        icon="bullseye"
        labelPosition="left"
        onClick={switchViewTo('properties')}
      />
      <Button
        className={activeClass('saturation')}
        size="mini"
        content="Saturates"
        icon="tint"
        labelPosition="left"
        onClick={switchViewTo('saturation')}
      />
      <Button
        className={activeClass('fats-common')}
        size="mini"
        content="Fatty Acids - Common"
        icon="bars"
        labelPosition="left"
        onClick={switchViewTo('fats-common')}
      />
      <Button
        className={activeClass('fats-all')}
        size="mini"
        content="Fatty Acids - All"
        icon="bars"
        labelPosition="left"
        onClick={switchViewTo('fats-all')}
      />
      <Button
        className={activeClass('social')}
        size="mini"
        content="Social Statistics"
        icon="group"
        labelPosition="left"
        onClick={switchViewTo('social')}
      />
    </Button.Group>
  );

  function switchViewTo(view) {
    return () => onChangeGridColumns(view);
  }

  function activeClass(view) {
    return cx({ active: gridColumns === view });
  }
}

ColumnButtons.propTypes = {
  gridColumns: PropTypes.string.isRequired,
  onChangeGridColumns: PropTypes.func.isRequired
};

function OilTable({ oils, columns }) {
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('ascending');

  const sortedOils = useCreation(() => {
    return _.chain(oils)
      .sortBy(oil => oil[sortColumn])
      .thru(sorted => (sortDirection === 'descending' ? _.reverse(sorted) : sorted))
      .value();
  }, [sortColumn, sortDirection, oils]);

  return (
    <Table sortable celled striped>
      <Table.Header>
        <OilTableHeader
          columns={columns}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSortColumn={setSortColumn}
          onSortDirection={setSortDirection}
        />
      </Table.Header>

      <Table.Body>
        {_.map(sortedOils, oil => (
          <OilRow
            oil={oil}
            columns={columns}
            key={`oil-${oil.id}`}
          />
        ))}
      </Table.Body>
    </Table>
  );
}

OilTable.propTypes = {
  oils: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired
};

function OilTableHeader({ columns, sortColumn, sortDirection, onSortDirection, onSortColumn }) {
  return (
    <Table.Row>
      {_.map(columns, column => (
        <Table.HeaderCell
          key={`column-${column.accessor}`}
          sorted={column.accessor === sortColumn ? sortDirection : null}
          onClick={handleColumnSort(column.accessor)}
        >
          {column.header}
        </Table.HeaderCell>
      ))}
    </Table.Row>
  );

  function handleColumnSort(column) {
    return () => {
      if (column === sortColumn) {
        onSortDirection(sortDirection === 'ascending' ? 'descending' : 'ascending');
      } else {
        onSortColumn(column);
        onSortDirection('ascending');
      }
    };
  }
}

OilTableHeader.propTypes = {
  columns: PropTypes.array.isRequired,
  sortColumn: PropTypes.string.isRequired,
  sortDirection: PropTypes.string.isRequired,
  onSortDirection: PropTypes.func.isRequired,
  onSortColumn: PropTypes.func.isRequired
};

function OilRow({ oil, columns }) {
  return (
    <Table.Row data-cy="oil-row">
      {_.map(columns, column => (
        <Table.Cell
          key={`column-${oil.id}-${column.accessor}`}
          collapsing={!(_.isFunction(column.Cell))}
        >
          {column.Cell ? column.Cell(oil) : oil[column.accessor]}
        </Table.Cell>
      ))}
    </Table.Row>
  );
}

OilRow.propTypes = {
  oil: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired
};


function oilPropertyGroupings() {
  return {
    // eslint-disable-next-line
    'fats-common': ['name', 'sap', 'lauric', 'linoleic', 'linolenic', 'myristic', 'oleic', 'palmitic', 'ricinoleic', 'stearic'],
    // eslint-disable-next-line
    'fats-all': ['name', 'sap', 'capric', 'caprylic', 'docosadienoic', 'docosenoid', 'eicosenoic', 'erucic', 'lauric', 'linoleic', 'linolenic', 'myristic', 'oleic', 'palmitic', 'ricinoleic', 'stearic'],
    properties: ['name', 'sap', 'bubbly', 'cleansing', 'condition', 'hardness', 'longevity', 'stability'],
    saturation: ['name', 'sap', 'saturated', 'monoSaturated', 'polySaturated'],
    social: ['name', 'comments', 'posts', 'recipes']
  };
}

function getFlatOilProperties(inputOils) {
  return _.chain(inputOils)
    .map(oil => oilProperties(oil))
    .map((oil) => {
      return {
        id: oil.id,
        name: oil.name,
        sap: oil.sap,
        iodine: oil.iodione,
        ins: oil.ins,

        bubbly: oil.properties.bubbly,
        cleansing: oil.properties.cleansing,
        condition: oil.properties.condition,
        hardness: oil.properties.hardness,
        longevity: oil.properties.longevity,
        stability: oil.properties.stable,

        capric: oil.breakdown.capric || 0,
        caprylic: oil.breakdown.caprylic || 0,
        docosadienoic: oil.breakdown.docosadienoic || 0,
        docosenoid: oil.breakdown.docosenoid || 0,
        eicosenoic: oil.breakdown.eicosenoic || 0,
        erucic: oil.breakdown.erucic || 0,
        lauric: oil.breakdown.lauric || 0,
        linoleic: oil.breakdown.linoleic || 0,
        linolenic: oil.breakdown.linolenic || 0,
        myristic: oil.breakdown.myristic || 0,
        oleic: oil.breakdown.oleic || 0,
        palmitic: oil.breakdown.palmitic || 0,
        ricinoleic: oil.breakdown.ricinoleic || 0,
        stearic: oil.breakdown.stearic || 0,

        saturated: oil.saturation.saturated,
        monoSaturated: oil.saturation.monoSaturated,
        polySaturated: oil.saturation.polySaturated,

        comments: _.get(oil, 'stats.comments.comments', 0),
        posts: _.get(oil, 'stats.posts.posts', 0),
        recipes: _.get(oil, 'stats.recipes.count', 0)
      };
    })
    .value();
}
