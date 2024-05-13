import React from 'react';

import useAuthenticated from 'hooks/useAuthenticated';

import LinkText from 'components/shared/LinkText';
import LoginSignup from 'components/shared/Modals/LoginSignup';

export default function LoginWrapper({ children, toAction }) {
  const authenticated = useAuthenticated();

  if (authenticated) {
    return children;
  } else {
    return (
      <div className="login-wrapper">
        Please <LoginSignup><LinkText content="login" /></LoginSignup> {toAction}.
      </div>
    );
  }
}
