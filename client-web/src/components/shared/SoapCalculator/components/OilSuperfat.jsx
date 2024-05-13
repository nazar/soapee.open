import React from 'react';
import PropTypes from 'prop-types';
import { Message, Transition } from 'semantic-ui-react';

import { Checkbox, InputNumber, ErrorMessage } from 'components/shared/Form';
import Tabular from 'components/shared/Tabular';

export default function OilSuperfat({ formState, register }) {
  return (
    <div className="oil-superfat">
      <Tabular unstackable>
        <Tabular.Row>
          <Tabular.Column collapsing minNumericWidth>
            <InputNumber
              fluid
              size="double"
              name="superFat"
              placeholder="%"
              register={register}
              data-cy="superfat-input"
            />
          </Tabular.Column>

          <Tabular.Column>
            <label>% superfat of oils - recommended &lt;5%</label>
          </Tabular.Column>
        </Tabular.Row>

        <Tabular.Row>
          <Tabular.Column collapsing colSpan="2">
            <ErrorMessage name="superFat" register={register} />
          </Tabular.Column>
        </Tabular.Row>

        <Tabular.Row>
          <Tabular.Column collapsing>
            <Checkbox
              name="superfatAfter"
              register={register}
              data-cy="superfat-after"
            />
          </Tabular.Column>

          <Tabular.Column>
            <label>Superfat after cook</label>
          </Tabular.Column>
        </Tabular.Row>
      </Tabular>

      <Transition visible={formState.superfatAfter}>
        <Message
          placement="top"
        >
          The recipe will be calculated with 0% superfat but will show the{' '}
          <strong>Fragrance Oil Weight</strong> to add to the recipe after cooking.
        </Message>
      </Transition>
    </div>
  );
}

OilSuperfat.propTypes = {
  formState: PropTypes.object.isRequired,
  register: PropTypes.object.isRequired
};
