import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Transition, Message } from 'semantic-ui-react';

import { InputNumber } from 'components/shared/Form';
import Tabular from 'components/shared/Tabular';

export default function MixedRatios({ formState, register, ...rest }) {
  const mixedTotalRatios = (_.get(formState, 'ratioKoh') || 0) + (_.get(formState, 'ratioNaoh') || 0);

  return (
    <Tabular {...rest}>
      <Tabular.Row>
        <Tabular.Column>
          <InputNumber
            name="ratioKoh"
            label="% KOH"
            placeholder="Purity as %"
            register={register}
          />
        </Tabular.Column>

        <Tabular.Column>
          <InputNumber
            name="ratioNaoh"
            label="% NaOH"
            placeholder="Purity as %"
            register={register}
          />
        </Tabular.Column>
      </Tabular.Row>

      <Transition visible={mixedTotalRatios > 100}>
        <Message negative>
          Lye ratios are over 100%
        </Message>
      </Transition>

      <Transition visible={mixedTotalRatios < 100}>
        <Message color="orange">
          Lye ratios should total 100%
        </Message>
      </Transition>
    </Tabular>
  );
}

MixedRatios.defaultProps = {
  formState: null
};

MixedRatios.propTypes = {
  formState: PropTypes.object,
  register: PropTypes.object.isRequired
};
