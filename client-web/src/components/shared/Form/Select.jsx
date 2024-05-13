import React from 'react';
import PropTypes from 'prop-types';
import { Form, Select as SemanticSelect } from 'semantic-ui-react';

export default function Dropdown({ name, register, ...rest }) {
  return (
    <Form.Field
      name={name}
      control={SemanticSelect}
      {...register.registerInput(name)}
      {...rest}
    />
  );
}

Dropdown.propTypes = {
  name: PropTypes.string.isRequired,
  register: PropTypes.object.isRequired
};
