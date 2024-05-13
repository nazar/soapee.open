import React from 'react';
import PropTypes from 'prop-types';
import NumberFormat from 'react-number-format';
import cx from 'clsx';

// https://github.com/s-yadav/react-number-format#values-object
export default function InputNumber({ className, ...rest }) {
  return (
    <NumberFormat
      className={cx('input-number-component', className)}
      decimalScale={3}
      {...rest}
    />
  );
}

InputNumber.defaultProps = {
  className: null
};

InputNumber.propTypes = {
  className: PropTypes.string
};
