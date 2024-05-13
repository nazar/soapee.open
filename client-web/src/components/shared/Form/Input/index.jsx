import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input as SemanticInput } from 'semantic-ui-react';
import cx from 'clsx';

import './style.styl';

export default function Input({ register, name, className, thin, float, centered, required, ...rest }) {
  return (
    <Form.Field
      className={cx('soapee-input', className, { thin, float, centered })}
      required={required}
      control={SemanticInput}
      {...register.registerInput(name)}
      {...rest}
    />
  );
}

Input.defaultProps = {
  className: null,
  thin: false,
  float: false,
  centered: false,
  required: false
};

Input.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  register: PropTypes.object.isRequired,
  thin: PropTypes.bool,
  float: PropTypes.bool,
  centered: PropTypes.bool,
  required: PropTypes.bool
};
