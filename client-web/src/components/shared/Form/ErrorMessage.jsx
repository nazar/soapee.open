import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Label, Message } from 'semantic-ui-react';
import { useCreation } from 'ahooks';
import cx from 'clsx';
import hashSum from 'hash-sum';

import './formFieldErrorMessage.styl';

export default function FormFieldErrorMessage({ name, register, padded, message, first, always }) {
  const { errors, dirty } = register.registerMetaFields();

  const errorsToDisplay = useCreation(() => _.chain(errors)
    .filter({ path: name })
    .thru(e => (
      first
        ? _.chain(e).first().thru(ensureArray).value()
        : e
    ))
    .value(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hashSum([name, errors, first])]
  );

  if (!(_.isNil(dirty))) {
    if (_.get(dirty, name) || always) {
      return _.map(errorsToDisplay, renderError);
    } else {
      return null;
    }
  } else {
    return _.map(errorsToDisplay, renderError);
  }

  //

  function renderError({ message: errorMessage, path, type }) {
    return (
      <ErrorMessage
        key={`${path}-${type}`}
        message={message}
        padded={padded}
        error={errorMessage}
      />
    );
  }
}

FormFieldErrorMessage.defaultProps = {
  padded: false,
  message: false,
  first: false,
  always: false
};

FormFieldErrorMessage.propTypes = {
  name: PropTypes.string.isRequired,
  register: PropTypes.object.isRequired,
  padded: PropTypes.bool,
  message: PropTypes.bool,
  first: PropTypes.bool,
  always: PropTypes.bool
};

function ErrorMessage({ message, error, padded }) {
  if (message) {
    return (
      <Message negative>
        {error}
      </Message>
    );
  } else {
    return (
      <Label
        basic
        pointing
        color="red"
        className={cx('form-field-error-message', { padded })}
        data-cy="form-field-error-message"
      >
        {error}
      </Label>
    );
  }
}

function ensureArray(thru) {
  if (_.isArray(thru)) {
    return thru;
  } else if (!(_.isNil(thru))) {
    return [thru];
  }
}
