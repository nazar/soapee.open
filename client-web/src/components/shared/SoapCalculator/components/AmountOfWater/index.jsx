import React from 'react';
import PropTypes from 'prop-types';

import Tabular from 'components/shared/Tabular';
import { InputNumber, Radio } from 'components/shared/Form';

import './style.styl';


export default function AmountOfWater({ register }) {
  return (
    <div className="amount-of-water">
      <Tabular.Group>
        <Tabular unstackable>
          <Tabular.Row>
            <Tabular.Column>
              <Radio
                id="lyeCalcTypeRatio"
                name="lyeCalcType"
                value="ratio"
                register={register}
                data-cy="amount-water-type-ratio"
              />
            </Tabular.Column>

            <Tabular.Column collapsing>
              <InputNumber
                fluid
                size="double"
                name="waterRatio"
                placeholder="as %"
                register={register}
                data-cy="amount-water-type-ratio-input"
              />
            </Tabular.Column>

            <Tabular.Column>
              <label htmlFor="lyeCalcTypeRatio">% Water as a percent of oils - recommended 33%-38%</label>
            </Tabular.Column>
          </Tabular.Row>

          <Tabular.Row>
            <Tabular.Column>
              <Radio
                id="lyeCalcTypeConcentration"
                name="lyeCalcType"
                value="concentration"
                register={register}
                data-cy="amount-water-type-concentration"
              />
            </Tabular.Column>

            <Tabular.Column collapsing>
              <InputNumber
                fluid
                size="double"
                name="recipeLyeConcentration"
                placeholder="as %"
                register={register}
                data-cy="amount-water-type-concentration-input"
              />
            </Tabular.Column>

            <Tabular.Column>
              <label htmlFor="lyeCalcTypeConcentration">% Lye Concentration</label>
            </Tabular.Column>
          </Tabular.Row>
        </Tabular>

        <Tabular unstackable className="no-margin">
          <Tabular.Row>
            <Tabular.Column collapsing>
              <Radio
                id="lyeCalcTypeLyewater"
                name="lyeCalcType"
                value="lyewater"
                register={register}
                data-cy="amount-water-type-lyewater"
              />
            </Tabular.Column>

            <Tabular.Column collapsing>
              <InputNumber
                fluid
                size="single"
                name="lyeWaterWaterRatio"
                register={register}
                data-cy="amount-water-type-lyewater-input"
              />
            </Tabular.Column>
            <Tabular.Column collapsing>:</Tabular.Column>
            <Tabular.Column collapsing>
              <InputNumber
                size="double"
                name="lyeWaterLyeRatio"
                register={register}
              />
            </Tabular.Column>

            <Tabular.Column>
              <label htmlFor="lyeCalcTypeLyewater">Water : Lye Ratio</label>
            </Tabular.Column>
          </Tabular.Row>
        </Tabular>

        <Tabular unstackable>
          <Tabular.Row>
            <Tabular.Column collapsing>
              <InputNumber
                fluid
                id="waterDiscount"
                name="waterDiscount"
                size="double"
                register={register}
                placeholder="as %"
              />
            </Tabular.Column>

            <Tabular.Column>
              <label htmlFor="waterDiscount">% Water Discount</label>
            </Tabular.Column>
          </Tabular.Row>
        </Tabular>
      </Tabular.Group>
    </div>
  );
}

AmountOfWater.propTypes = {
  register: PropTypes.object.isRequired
};
