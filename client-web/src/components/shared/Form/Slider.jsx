import React from 'react';
import PropTypes from 'prop-types';
import RcSlider from 'rc-slider';

export default function Slider({ name, register, ...rest }) {
  return (
    <RcSlider
      {...register.registerRange(name)}
      {...rest}
    />
  );
}

Slider.propTypes = {
  name: PropTypes.string.isRequired,
  register: PropTypes.object.isRequired
};

Slider.Range = function Range({ name, min, max, register, ...rest }) {
  return (
    <RcSlider.Range
      min={min}
      max={max}
      {...register.registerRange(name)}
      {...rest}
    />
  );
};

Slider.Range.propTypes = {
  name: PropTypes.string.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  register: PropTypes.object.isRequired
};
