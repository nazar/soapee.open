import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import cx from 'clsx';

import { Slider } from 'components/shared/Form';
import useMedia, { mobile } from 'hooks/useMedia';

import './recipeProperties.styl';

export default function RecipeProperties({ formState, register }) {
  const marks = {
    0: '0%',
    50: '50%',
    100: '100%'
  };

  const otherMarks = {
    0: '0',
    50: '50',
    100: '100',
    200: '200',
    500: '500'
  };

  const properties = [
    { name: 'properties.bubbly', label: 'Bubbly' },
    { name: 'properties.stable', label: 'Stability' },
    { name: 'properties.hardness', label: 'Hardness' },
    { name: 'properties.cleansing', label: 'Cleansing' },
    { name: 'properties.condition', label: 'Conditioning' }
  ];

  const isMobile = useMedia(mobile);

  return (
    <div className="search-recipe-properties">
      <Grid columns="equal" stackable>
        <Grid.Row>
          {_.map(properties, property => (
            <Grid.Column
              textAlign="center"
              className={cx({ horizontal: isMobile, vertical: !isMobile })}
              key={`column-${property.label}`}
            >
              <label>
                {property.label}&nbsp;
                {isMobile && <SliderValue formState={formState} name={property.name} postfix="%" />}
              </label>

              <Slider.Range
                vertical={!isMobile}
                marks={marks}
                name={property.name}
                min={0}
                max={100}
                register={register}
              />

              {!isMobile && <SliderValue formState={formState} name={property.name} postfix="%" />}
            </Grid.Column>
          ))}
        </Grid.Row>

        <Grid.Row>
          <Grid.Column textAlign="center" className="horizontal first">
            <label>INS  <SliderValue formState={formState} name="properties.ins" /></label>
            <Slider.Range
              marks={otherMarks}
              name="properties.ins"
              min={0}
              max={500}
              register={register}
            />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column textAlign="center" className="horizontal last">
            <div className="wrapper">
              <label>Iodine  <SliderValue formState={formState} name="properties.iodine" /></label>
              <Slider.Range
                marks={otherMarks}
                name="properties.iodine"
                min={0}
                max={500}
                register={register}
              />
            </div>
          </Grid.Column>
        </Grid.Row>

      </Grid>
    </div>
  );
}

RecipeProperties.propTypes = {
  formState: PropTypes.object.isRequired,
  register: PropTypes.object.isRequired
};

function SliderValue({ formState, name, postfix = '' }) {
  const min = _.get(formState, `${name}.min`);
  const max = _.get(formState, `${name}.max`);

  return (
    <label className="value-label">
      {`${min}${postfix}`} - {`${max}${postfix}`}
    </label>
  );
}

SliderValue.defaultProps = {
  postfix: ''
};

SliderValue.propTypes = {
  formState: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  postfix: PropTypes.string
};
