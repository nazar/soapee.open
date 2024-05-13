import React from 'react';
import PropTypes from 'prop-types';
import { Form, Radio as SemanticRadio } from 'semantic-ui-react';

export default function Radio({ register, name, value, ...rest }) {
  return (
    <Form.Field
      {...register.registerRadio(name, value)}
      control={SemanticRadio}
      {...rest}
    />
  );
}

Radio.propTypes = {
  register: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired
};
