import React from 'react';
import PropTypes from 'prop-types';
import { Message } from 'semantic-ui-react';

import noop from 'services/noop';
import LinkText from 'components/shared/LinkText';
import LoginSignup from 'components/shared/Modals/LoginSignup';

export default function LoginToCreatePostCTA({ cta, 'data-cy': dataCy, onLoggedIn }) {
  return (
    <Message data-cy={dataCy}>
      Please{' '}
      <LoginSignup onLoggedIn={onLoggedIn}>
        <LinkText content="login" data-cy="login" />
      </LoginSignup>{' '}
      to {cta}.
    </Message>
  );
}

LoginToCreatePostCTA.defaultProps = {
  onLoggedIn: noop,
  'data-cy': null
};

LoginToCreatePostCTA.propTypes = {
  cta: PropTypes.string.isRequired,
  'data-cy': PropTypes.string,
  onLoggedIn: PropTypes.func
};
