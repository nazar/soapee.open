import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'semantic-ui-react';
import { useCreation } from 'ahooks';
import cx from 'clsx';

import TooltipQuestion from 'components/shared/TooltipQuestion';

export default function RecipeProperties({ recipe, withRange, showTooltips, printable, ...rest }) {
  const classname = cx({ printable });

  return (
    <Table className={classname} unstackable compact striped {...rest}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Property</Table.HeaderCell>
          <Table.HeaderCell>%</Table.HeaderCell>
          { withRange && <Table.HeaderCell>Recommended</Table.HeaderCell> }
        </Table.Row>
      </Table.Header>

      <Table.Body>
        <OrderedBreakdowns recipe={recipe} showTooltips={showTooltips} withRange={withRange} />

        <Table.Row>
          <Table.Cell colSpan="3" />
        </Table.Row>

        <NonProperties recipe={recipe} withRange={withRange} />
      </Table.Body>
    </Table>
  );
}

RecipeProperties.defaultProps = {
  withRange: false,
  showTooltips: false,
  printable: false
};

RecipeProperties.propTypes = {
  recipe: PropTypes.object.isRequired,
  withRange: PropTypes.bool,
  showTooltips: PropTypes.bool,
  printable: PropTypes.bool
};

function NonProperties({ recipe, withRange }) {
  const { properties } = recipe;

  if (_.keys(properties).length) {
    return _.map(['iodine', 'ins'], (property) => {
      const value = _.round(properties[property]);

      return (
        <Table.Row key={`non-prop-${property}`} data-cy={`property-cell-${property}`}>
          <Table.Cell>{_.capitalize(property)}</Table.Cell>
          <Table.Cell>{value}</Table.Cell>
          {withRange && (
            <Table.Cell textAlign="center">{ rangesForProperty(property) }</Table.Cell>
          )}
        </Table.Row>
      );
    });
  } else {
    return null;
  }
}


function OrderedBreakdowns({ recipe, showTooltips, withRange }) {
  const { properties } = recipe;

  const propertyKeys = useCreation(
    () => _.chain(recipe)
      .get('properties')
      .keys()
      .sort()
      .filter(property => !(_.includes(['ins', 'iodine'], property)))
      .value()
    , [recipe]
  );

  return _.map(propertyKeys, (property) => {
    const value = _.round(properties[property]);

    return (
      <Table.Row key={`recipe-oil-prop-${property}`} data-cy={`property-cell-${property}`}>
        <Table.Cell className="property-cell">
          {showTooltips && (
            <TooltipQuestion>
              {tooltipsForProperty(property)}
            </TooltipQuestion>
          )}
          {_.capitalize(property)}
        </Table.Cell>

        <Table.Cell>{value}</Table.Cell>

        {withRange && (
          <Table.Cell textAlign="center">{ rangesForProperty(property) }</Table.Cell>
        )}
      </Table.Row>
    );
  });
}

function tooltipsForProperty(property) {
  return propertyDescriptions[property];
}

function rangesForProperty(property) {
  return propertyRanges[property];
}

const propertyDescriptions = {
  bubbly: 'This is a measure of how much loose, fluffy lather is produced. A "bubbly" lather is produced quickly by a soap, but doesn\'t last long',
  cleansing: 'It is a measure of how water soluble the soap is -- meaning it is a measure of how easily the soap dissolves in difficult situations such as hard water, cold water, or salt water. The Cleansing number does NOT tell you whether the soap will actually get your skin clean.',
  condition: 'The conditioning value is a measure of the soap\'s ability to soften and soothe the skin. The "anti tight-and-dry" property, so to speak.',
  hardness: 'The Hardness number is a measure of the physical hardness-like-a-rock. It tells you how relatively easy it will be to unmold a particular soap after saponification. It does NOT necessarily tell you how long-lived the soap will be.',
  longevity: 'It is a guideline for how long you soap will last. The higher the number the longer lasting the soap. Too low and the soap doesn\'t last sufficiently long in the shower. Too high and the soap doesn\'t lather as well.',
  stable: 'How long the lather will stay fluffy with big bubbles'
};

const propertyRanges = {
  bubbly: '14 - 46',
  cleansing: '12 - 22',
  condition: '44 - 69',
  hardness: '29 - 54',
  longevity: '25 - 50',
  stable: '16 - 48',
  iodine: '41 - 70',
  ins: '136 - 165'
};
