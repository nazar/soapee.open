import React from 'react';
import PropTypes from 'prop-types';
import { Form, TextArea as SemanticTextArea } from 'semantic-ui-react';

export default function TextArea({ name, register, ...rest }) {
  return (
    <Form.Field
      name={name}
      control={SemanticTextArea}
      {...register.registerInput(name)}
      {...rest}
    />
  );
}

TextArea.propTypes = {
  name: PropTypes.string.isRequired,
  register: PropTypes.object.isRequired
};
