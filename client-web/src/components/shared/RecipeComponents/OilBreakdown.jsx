import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table } from 'semantic-ui-react';
import { useCreation } from 'ahooks';
import cx from 'clsx';

import roundFormatted from './utils/roundFormatted';


export default function OilBreakdown({ recipe, printable, linkable, ...rest }) {
  const classnames = cx({ printable });
  const uomWidth = !(recipe.display.isUomGrams) ? '3' : '4';

  return (
    <Table className={classnames} unstackable compact striped {...rest}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell width="8">Oil</Table.HeaderCell>
          <Table.HeaderCell width={uomWidth}>%</Table.HeaderCell>
          <Table.HeaderCell width={uomWidth}>{`${_.capitalize(recipe.display.uomToUse)}s`}</Table.HeaderCell>
          {!(recipe.display.isUomGrams) && <Table.HeaderCell width="2">Grams</Table.HeaderCell>}
        </Table.Row>
      </Table.Header>

      <Table.Body>
        <OilRows linkable={linkable} recipe={recipe} />
      </Table.Body>

      <Table.Footer>
        <OilsTotal recipe={recipe} />
      </Table.Footer>
    </Table>
  );
}

OilBreakdown.defaultProps = {
  printable: false,
  linkable: false
};

OilBreakdown.propTypes = {
  recipe: PropTypes.object.isRequired,
  printable: PropTypes.bool,
  linkable: PropTypes.bool
};

function OilRows({ recipe, linkable }) {
  const weightRations = useCreation(
    () => _.orderBy(recipe.display.recipeOilsWeightsRatios, 'oil.name'),
    [recipe.display.recipeOilsWeightsRatios]
  );

  return _.map(weightRations, (weightRatio) => (
    <Table.Row key={`oil-${weightRatio.oil.id}`}>
      <Table.Cell data-cy="recipe-comps-oil-row-name">
        <NameOrLink oil={weightRatio.oil} linkable={linkable} />
      </Table.Cell>

      <Table.Cell data-cy="recipe-comps-oil-row-ratio">{ _.round(weightRatio.ratio * 100, 1) }</Table.Cell>

      <Table.Cell data-cy="recipe-comps-oil-row-weight">
        {roundFormatted(weightRatio.weight, recipe.display.roundPlaces)}
      </Table.Cell>

      {!(recipe.display.isUomGrams) && (
        <Table.Cell data-cy="recipe-comps-oil-row-grams">
          { showInGrams(weightRatio.weight) }
        </Table.Cell>
      )}
    </Table.Row>
  ));

  //

  function showInGrams(weight) {
    const converted = recipe.display.convertWeightToGrams(weight);

    return roundFormatted(converted, 1);
  }
}

function NameOrLink({ oil, linkable }) {
  if (linkable) {
    return <Link to={`/oils/${oil.id}`} target="_blank">{oil.name}</Link>;
  } else {
    return oil.name;
  }
}

function OilsTotal({ recipe }) {
  const totals = _.reduce(recipe.display.recipeOilsWeightsRatios, (result, oilRow) => {
    return _.tap(result, (r) => {
      r.ratio = result.ratio + oilRow.ratio * 100;
      r.weight = result.weight + Number(oilRow.weight);
    });
  }, { ratio: 0, weight: 0 });

  const places = recipe.display.roundPlaces;

  return (
    <Table.Row>
      <Table.HeaderCell>&nbsp;</Table.HeaderCell>
      <Table.HeaderCell data-cy="recipe-comps-oils-total-ratio">
        <strong>{ _.round(totals.ratio, 1) }</strong>
      </Table.HeaderCell>

      <Table.HeaderCell data-cy="recipe-comps-oils-total-weight">
        <strong>{ roundFormatted(totals.weight, places) }</strong>
      </Table.HeaderCell>

      {!(recipe.display.isUomGrams) && (
        <Table.HeaderCell data-cy="recipe-comps-oils-total-grams">
          {showRecipeInGrams(totals.weight)}
        </Table.HeaderCell>
      )}
    </Table.Row>
  );

  //

  function showRecipeInGrams(weight) {
    const placesGrams = 1;
    const converted = recipe.display.convertWeightToGrams(weight);

    return roundFormatted(converted, placesGrams);
  }
}

OilsTotal.propTypes = {
  recipe: PropTypes.object.isRequired
};
