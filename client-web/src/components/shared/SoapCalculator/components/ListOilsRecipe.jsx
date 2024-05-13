import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Table, Button, Message, Transition } from 'semantic-ui-react';

import { InputNumber } from 'components/shared/Form';


export default function ListOilsRecipe({ formState: { oils, uom }, recipe, register, onRemove }) {
  if (_.get(oils, 'length') > 0) {
    return (
      <div className="list-oil-recipe" data-cy="list-oil-weights">
        <Table unstackable celled compact striped>
          <Table.Body>
            <Transition.Group duration={200}>
              {_.map(oils, (oil, index) => (
                <Table.Row key={`oil-${oil.id}`}>
                  <Table.Cell width="13">{oil.name}</Table.Cell>

                  <Table.Cell width="3">
                    <InputNumber
                      fluid
                      size="double"
                      name={`oils[${index}].weight`}
                      placeholder={uomPlaceholder(uom)}
                      register={register}
                    />
                  </Table.Cell>

                  <Table.Cell collapsing>
                    <Button
                      negative
                      type="button"
                      size="mini"
                      icon="times"
                      color="red"
                      onClick={() => onRemove(index)}
                    />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Transition.Group>
          </Table.Body>

          <OilTotals recipe={recipe} uom={uom} />
        </Table>
      </div>
    );
  } else {
    return (
      <Message>
        Select an oil from the <strong>Select Oils</strong> list to add it to your recipe
      </Message>
    );
  }
}

function OilTotals({ recipe, uom }) {
  return (
    <Table.Footer>
      <Table.Row>
        <Table.HeaderCell>&nbsp;</Table.HeaderCell>
        <Table.HeaderCell textAlign="center" data-cy="recipe-oils-total">
          {`${(recipe.display.sumWeightsUomRounded || 0).toLocaleString()} ${uomPlaceholder(uom)}`}
        </Table.HeaderCell>
        <Table.HeaderCell>&nbsp;</Table.HeaderCell>
      </Table.Row>
    </Table.Footer>
  );
}

OilTotals.propTypes = {
  recipe: PropTypes.object.isRequired,
  uom: PropTypes.string.isRequired
};

function uomPlaceholder(uom) {
  const placeholders = {
    percent: '%',
    gram: 'g',
    kilo: 'kg',
    pound: 'lb',
    ounce: 'oz'
  };

  return placeholders[uom];
}
