import _ from 'lodash';
import React from 'react';
import { Table, Button, Transition, Message } from 'semantic-ui-react';

import { Input, ErrorMessage } from 'components/shared/Form';


export default function ListAdditivesRecipe({ formState: { additives }, register, onRemove }) {
  if (_.get(additives, 'length') > 0) {
    return (
      <div className="list-additive-recipe" data-cy="list-additive-weights">
        <Table unstackable celled compact striped>
          <Table.Body>
            <Transition.Group duration={200}>
              {_.map(additives, (additive, index) => (
                <Table.Row key={`additive-${additive.id}`} data-cy="additive-selected-row">
                  <Table.Cell width="12">
                    {additive.name}
                  </Table.Cell>

                  <Table.Cell width="4">
                    <Input
                      fluid
                      name={`additives[${index}].weight`}
                      placeholder="i.e. 1 tsp"
                      register={register}
                    />
                    <ErrorMessage name={`additives[${index}].weight`} register={register} />
                  </Table.Cell>

                  <Table.Cell collapsing>
                    <Button
                      negative
                      type="button"
                      size="mini"
                      icon="times"
                      color="red"
                      data-cy="remove-additive"
                      onClick={() => onRemove(index)}
                    />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Transition.Group>
          </Table.Body>
        </Table>
      </div>
    );
  } else {
    return (
      <Message>
        Select an additive from the <strong>Select Additives</strong> list to add it to your recipe
      </Message>
    );
  }
}
