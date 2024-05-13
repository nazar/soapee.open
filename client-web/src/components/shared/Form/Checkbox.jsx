import React from 'react';
import PropTypes from 'prop-types';
import { Form, Checkbox as SemanticCheckbox } from 'semantic-ui-react';

export default function Checkbox({ register, name, ...rest }) {
  return (
    <Form.Field
      {...register.registerChecked(name)}
      control={SemanticCheckbox}
      {...rest}
    />
  );
}

Checkbox.propTypes = {
  name: PropTypes.string.isRequired,
  register: PropTypes.object.isRequired
};
