import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Menu, Message, Transition } from 'semantic-ui-react';

import { Checkbox, InputNumber, Radio } from 'components/shared/Form';
import Tabular from 'components/shared/Tabular';
import TooltipQuestion from 'components/shared/TooltipQuestion';

import { conversions, roundPlacesForUom } from 'services/calculator';

import './style.styl';


export default function UnitsOfMeasure({
  formState,
  register,
  onUomType,
  onSetWeight
}) {
  const weightType = formState?.uomType;

  return (
    <div className="units-of-measure" data-cy="units-of-measure">
      <Menu tabular>
        <Menu.Item
          name="weights"
          content="By weight"
          active={weightType === 'weights'}
          data-cy="units-by-weight"
          onClick={handleWeightType}
        />

        <Menu.Item
          name="dimensions"
          content="By Volume"
          active={weightType === 'dimensions'}
          data-cy="units-by-dimension"
          onClick={handleWeightType}
        />
      </Menu>

      {weightType === 'weights' && (
        <MeasureWeights
          formState={formState}
          register={register}
        />
      )}

      {weightType === 'dimensions' && (
        <MeasureDimensions
          formState={formState}
          register={register}
          onSetWeight={onSetWeight}
        />
      )}
    </div>
  );

  function handleWeightType(e, { name }) {
    onUomType(name);
  }
}

UnitsOfMeasure.propTypes = {
  formState: PropTypes.object.isRequired,
  register: PropTypes.object.isRequired,
  onUomType: PropTypes.func.isRequired,
  onSetWeight: PropTypes.func.isRequired
};

function MeasureWeights({ formState, register }) {
  return (
    <div className="measures-by-weight">
      <Tabular compact="very" className="uoms no-margin">
        <Tabular.Row>
          <Tabular.Column>
            <Radio register={register} name="uom" value="percent" label="Percentages" data-cy="uom-percent" />
          </Tabular.Column>
          <Tabular.Column>
            <Radio register={register} name="uom" value="gram" label="Grams" data-cy="uom-grams" />
          </Tabular.Column>
          <Tabular.Column>
            <Radio register={register} name="uom" value="kilo" label="Kilograms" data-cy="uom-kilogram" />
          </Tabular.Column>
          <Tabular.Column>
            <Radio register={register} name="uom" value="pound" label="Pounds" data-cy="uom-pounds" />
          </Tabular.Column>
          <Tabular.Column>
            <Radio register={register} name="uom" value="ounce" label="Ounces" data-cy="uom-ounces" />
          </Tabular.Column>
        </Tabular.Row>
      </Tabular>

      <Transition visible={isPercentMode(formState)}>
        <Tabular compact="very" className="uoms">
          <Tabular.Row>
            <Tabular.Column>
              <InputNumber
                register={register}
                className="max-width-90"
                name="totalWeight"
              />
            </Tabular.Column>
            <Tabular.Column>
              <Radio register={register} name="totalUom" value="gram" label="Grams" data-cy="uom-percent-grams" />
            </Tabular.Column>
            <Tabular.Column>
              <Radio
                register={register}
                name="totalUom"
                value="kilo"
                label="Kilograms"
                data-cy="uom-percent-kilogram"
              />
            </Tabular.Column>
            <Tabular.Column>
              <Radio
                register={register}
                name="totalUom"
                value="pound"
                label="Pounds"
                data-cy="uom-percent-pounds"
              />
            </Tabular.Column>
            <Tabular.Column>
              <Radio
                register={register}
                name="totalUom"
                value="ounce"
                label="Ounces"
                data-cy="uom-percent-ounces"
              />
            </Tabular.Column>
          </Tabular.Row>
        </Tabular>
      </Transition>

      <div>
        <Checkbox
          name="totalsIncludeWater"
          label="Adjust oil weights to include water in Oils total"
          className="padded-top"
          register={register}
        />

        <Transition duration={200} unmountOnHide visible={_.get(formState, 'totalsIncludeWater')}>
          <Message>
            Less oil will be used as the lye calculator will
            adjust total oil weights to include water weight.
          </Message>
        </Transition>
      </div>
    </div>
  );


  function isPercentMode() {
    return _.get(formState, 'uom') === 'percent';
  }
}

MeasureWeights.propTypes = {
  formState: PropTypes.object.isRequired,
  register: PropTypes.object.isRequired
};

function MeasureDimensions({ formState, register, onSetWeight }) {
  const [volumeWeight, setVolumeWeight] = useState();

  useEffect(() => {
    const volume = _.thru(formState?.uomDimensionType, (dimensionType) => {
      if (dimensionType === 'box') {
        return formState?.dimensionWidth * formState?.dimensionHeight * formState?.dimensionLength;
      } else if (dimensionType === 'cylinder') {
        // eslint-disable-next-line no-restricted-properties
        return Math.pow((formState?.dimensionDiameter / 2), 2) * Math.PI * formState?.dimensionHeight;
      }
    });

    if (_.isFinite(volume) && (volume > 0)) {
      const factor = conversions()[formState.totalUom];
      const round = roundPlacesForUom(formState.totalUom);

      setVolumeWeight(volume);
      onSetWeight(_.round(volume * 0.95 * factor, round));
    } else {
      setVolumeWeight();
    }
  }, [
    formState.totalUom,
    formState?.uomDimensionType,
    formState?.dimensionWidth,
    formState?.dimensionHeight,
    formState?.dimensionLength,
    formState?.dimensionDiameter
  ]);

  return (
    <div className="measures-by-dimensions">
      <Tabular compact="very" className="uoms-dims no-margin">
        <Tabular.Row>
          <Tabular.Column>
            <Radio register={register} name="totalUom" value="gram" label="Grams" data-cy="uom-percent-grams" />
          </Tabular.Column>
          <Tabular.Column>
            <Radio
              register={register}
              name="totalUom"
              value="kilo"
              label="Kilograms"
              data-cy="uom-percent-kilogram"
            />
          </Tabular.Column>
          <Tabular.Column>
            <Radio
              register={register}
              name="totalUom"
              value="pound"
              label="Pounds"
              data-cy="uom-percent-pounds"
            />
          </Tabular.Column>
          <Tabular.Column>
            <Radio
              register={register}
              name="totalUom"
              value="ounce"
              label="Ounces"
              data-cy="uom-percent-ounces"
            />
          </Tabular.Column>
        </Tabular.Row>

        <Tabular.Row>
          <Tabular.Column>
            <label>Container Type</label>
          </Tabular.Column>
          <Tabular.Column>
            <Radio
              register={register}
              name="uomDimensionType"
              value="box"
              label="Box"
              data-cy="uom-dimension-type-box"
            />
          </Tabular.Column>
          <Tabular.Column>
            <Radio
              register={register}
              name="uomDimensionType"
              value="cylinder"
              label="Cylinder"
              data-cy="uom-dimension-type-cylinder"
            />
          </Tabular.Column>
          <Tabular.Column>
            &nbsp;
          </Tabular.Column>
        </Tabular.Row>
      </Tabular>

      {formState?.uomDimensionType === 'box' && (
        <Tabular compact="very" className="uoms-dimensions">
          <Tabular.Row>
            <Tabular.Column collapsing>
              <InputNumber
                register={register}
                className="max-width-90"
                name="dimensionWidth"
                label="Width (cm)"
                data-cy="uom-dimension-type-box-width"
              />
            </Tabular.Column>
            <Tabular.Column collapsing>
              <InputNumber
                register={register}
                className="max-width-90"
                name="dimensionHeight"
                label="Height (cm)"
                data-cy="uom-dimension-type-box-height"
              />
            </Tabular.Column>
            <Tabular.Column collapsing>
              <InputNumber
                register={register}
                className="max-width-90"
                name="dimensionLength"
                label="Length (cm)"
                data-cy="uom-dimension-type-box-length"
              />
            </Tabular.Column>
            <Tabular.Column collapsing>
              {volumeWeight && (
                <InputNumber
                  readOnly
                  thousandSeparator
                  register={register}
                  className="max-width-90"
                  name="totalWeight"
                  data-cy="uom-dimension-type-total-weight"
                  label={<TotalWeightLabel totalUom={formState.totalUom} />}
                />
              )}

              {!(volumeWeight) && <div className="width-90" />}
            </Tabular.Column>
          </Tabular.Row>
        </Tabular>
      )}

      {formState?.uomDimensionType === 'cylinder' && (
        <Tabular compact="very" className="uoms">
          <Tabular.Row>
            <Tabular.Column collapsing>
              <InputNumber
                register={register}
                className="max-width-90"
                name="dimensionHeight"
                label="Height (cm)"
                data-cy="uom-dimension-type-cylinder-height"
              />
            </Tabular.Column>
            <Tabular.Column collapsing>
              <InputNumber
                register={register}
                className="max-width-90"
                name="dimensionDiameter"
                label="Diameter (cm)"
                data-cy="uom-dimension-type-cylinder-diameter"
              />
            </Tabular.Column>

            <Tabular.Column collapsing>
              {volumeWeight && (
                <InputNumber
                  readOnly
                  register={register}
                  sclassName="max-width-90"
                  name="totalWeight"
                  data-cy="uom-dimension-type-total-weight"
                  label={<TotalWeightLabel totalUom={formState.totalUom} />}
                />
              )}
              {!(volumeWeight) && <div className="width-90" />}
            </Tabular.Column>
          </Tabular.Row>
        </Tabular>
      )}
    </div>
  );
}

MeasureDimensions.propTypes = {
  formState: PropTypes.object.isRequired,
  register: PropTypes.object.isRequired,
  onSetWeight: PropTypes.func.isRequired
};

function TotalWeightLabel({ totalUom }) {
  return (
    <label>
      Weight ({totalUom})&nbsp;
      <TooltipQuestion>
        Oil weight is calculated using an average density for oil of 0.9 + water density to give 0.95 for the final
        weight
      </TooltipQuestion>
    </label>
  );
}

TotalWeightLabel.propTypes = {
  totalUom: PropTypes.number.isRequired
};
