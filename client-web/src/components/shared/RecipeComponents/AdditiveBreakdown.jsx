import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table } from 'semantic-ui-react';
import { useCreation } from 'ahooks';
import cx from 'clsx';

export default function AdditiveBreakdown({ recipeAdditives, printable, linkable, ...restTable }) {
  const classnames = cx({ printable });

  return (
    <Table className={classnames} unstackable compact striped data-cy="additives-breakdown" {...restTable}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell width="8">Additive</Table.HeaderCell>
          <Table.HeaderCell width="8">Measure</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        <AdditiveRows linkable={linkable} recipeAdditives={recipeAdditives} />
      </Table.Body>
    </Table>
  );
}

AdditiveBreakdown.defaultProps = {
  recipeAdditives: null,
  printable: false,
  linkable: false
};

AdditiveBreakdown.propTypes = {
  recipeAdditives: PropTypes.array,
  printable: PropTypes.bool,
  linkable: PropTypes.bool
};

function AdditiveRows({ recipeAdditives, linkable }) {
  const additives = useCreation(() => _.orderBy(recipeAdditives, 'name'), [recipeAdditives]);

  return _.map(additives, (additive) => (
    <Table.Row key={`additive-${additive.id}`} data-cy="recipe-comps-additive-row">
      <Table.Cell data-cy="recipe-comps-additive-row-name">
        <NameOrLink additive={additive} linkable={linkable} />
      </Table.Cell>

      <Table.Cell data-cy="recipe-comps-additive-row-measure">
        {additive.weight}
      </Table.Cell>
    </Table.Row>
  ));
}

function NameOrLink({ additive, linkable }) {
  if (linkable) {
    return <Link to={`/settings/additives/${additive.id}`} target="_blank">{additive.name}</Link>;
  } else {
    return additive.name;
  }
}
