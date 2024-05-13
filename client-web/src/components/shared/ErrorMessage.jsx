import React from 'react';
import PropTypes from 'prop-types';
import { Message } from 'semantic-ui-react';

export default function ErrorMessage({ message }) {
  return (
    <Message
      negative
      icon="stop circle"
      header="Error detected"
      content={message}
    />
  );
}

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired
};
