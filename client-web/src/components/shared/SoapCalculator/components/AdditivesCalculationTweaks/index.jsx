import React from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'semantic-ui-react';

import Tabular from 'components/shared/Tabular';
import { Checkbox, InputNumber } from 'components/shared/Form';

export default function AdditivesCalculationTweaks({ formState, register }) {
  return (
    <div className="additives-calculation-tweaks-component">
      <Checkbox
        name="enableCitricAdjust"
        label="Adjust Lye for Citric Acid"
        register={register}
        data-cy="enable-citric-adjust"
      />

      <Transition unmountOnHide duration={200} visible={formState.enableCitricAdjust}>
        <Tabular unstackable>
          <Tabular.Row>
            <Tabular.Column collapsing minNumericWidth>
              <InputNumber
                register={register}
                id="citricAdjustPercent"
                name="citricAdjustPercent"
                placeholder="%"
                data-cy="citric-adjust-percent"
              />
            </Tabular.Column>

            <Tabular.Column>
              <label htmlFor="citricAdjustPercent">% of oil weight</label>
            </Tabular.Column>
          </Tabular.Row>
        </Tabular>
      </Transition>
    </div>
  );
}

AdditivesCalculationTweaks.propTypes = {
  formState: PropTypes.object.isRequired,
  register: PropTypes.object.isRequired
};
