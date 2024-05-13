import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import { InputNumber, Radio } from 'components/shared/Form';
import Tabular from 'components/shared/Tabular';

import { largeUnit, smallUnit } from '../utils/units';

export default function Fragrances({ formState, register }) {
  return (
    <Tabular unstackable>
      <Tabular.Row>
        <Tabular.Column collapsing>
          <Radio
            name="fragranceType"
            value="ratio"
            register={register}
          />
        </Tabular.Column>

        <Tabular.Column collapsing>
          <InputNumber
            fluid
            size="double"
            register={register}
            name="fragrance"
          />
        </Tabular.Column>

        <Tabular.Column>
          <label>% oil weight - recommended 3%</label>
        </Tabular.Column>
      </Tabular.Row>

      <Tabular.Row>
        <Tabular.Column collapsing>
          <Radio
            name="fragranceType"
            value="ppo"
            register={register}
          />
        </Tabular.Column>

        <Tabular.Column collapsing>
          <InputNumber
            fluid
            size="double"
            name="fragrancePpo"
            register={register}
            placeholder={smallUomFragrance()}
          />

        </Tabular.Column>

        <Tabular.Column>
          <label>{ smallUomFragrance() }/{ largeUomFragrance() }</label>
        </Tabular.Column>
      </Tabular.Row>
    </Tabular>
  );

  //

  function smallUomFragrance() {
    const isPercentRecipe = _.get(formState, 'uom') === 'percent';
    const uom = isPercentRecipe ? _.get(formState, 'totalUom') : _.get(formState, 'uom');

    return smallUnit(uom);
  }

  function largeUomFragrance() {
    const isPercentRecipe = _.get(formState, 'uom') === 'percent';
    const uom = isPercentRecipe ? _.get(formState, 'totalUom') : _.get(formState, 'uom');

    return largeUnit(uom);
  }
}

Fragrances.propTypes = {
  formState: PropTypes.object.isRequired,
  register: PropTypes.object.isRequired
};
