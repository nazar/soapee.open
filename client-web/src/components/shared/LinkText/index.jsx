import React from 'react';
import PropTypes from 'prop-types';

import noop from 'services/noop';

import './linkText.styl';

export default function LinkText({ content, 'data-cy': dataCy, onClick }) {
  return (
    <span className="link-text" role="link" tabIndex={0}  data-cy={dataCy} onClick={onClick}>
      {content}
    </span>
  );
}

LinkText.defaultProps = {
  'data-cy': null,
  onClick: noop
};

LinkText.propTypes = {
  'data-cy': PropTypes.string,
  content: PropTypes.string.isRequired,
  onClick: PropTypes.func
};
