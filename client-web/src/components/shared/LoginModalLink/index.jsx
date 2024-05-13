import React from 'react';
import { Link } from 'react-router-dom';

import useAuthenticated from 'hooks/useAuthenticated';
import LoginSignup from 'components/shared/Modals/LoginSignup';

import './style.styl';

export default function LoginModalLink({ to, children }) {
  const authenticated = useAuthenticated();

  if (authenticated) {
    return (
      <Link to={to}>{children}</Link>
    );
  } else {
    return (
      <LoginSignup>
        <span
          className="login-modal-link-component"
          data-cy="login-modal-link"
        >
          {children}
        </span>
      </LoginSignup>
    );
  }
}
