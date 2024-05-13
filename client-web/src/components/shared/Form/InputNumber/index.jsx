import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic-ui-react';
import cx from 'clsx';

import Input from 'components/shared/InputNumber';

import './style.styl';

export default function InputNumber({
  register,
  name,
  className,
  size,
  centered,
  fluid,
  ...rest
}) {
  const klass = cx('soapee-input input-number',
    className,
    size && `size-${size}`,
    {
      centered,
      fluid
    }
  );

  return (
    <Form.Field
      className={klass}
      control={Input}
      {...register.registerInputNumber(name)}
      {...rest}
      isNumericString
    />
  );
}

InputNumber.defaultProps = {
  className: null,
  centered: false,
  float: false,
  fluid: false,
  size: null
};

InputNumber.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  centered: PropTypes.bool,
  float: PropTypes.bool,
  fluid: PropTypes.bool,
  register: PropTypes.object.isRequired,
  size: PropTypes.oneOf(['single', 'double', 'tripple'])
};
