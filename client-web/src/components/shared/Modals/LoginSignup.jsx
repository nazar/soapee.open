import _ from 'lodash';
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Header, Menu, Modal, Segment } from 'semantic-ui-react';

import noop from 'services/noop';
import useAuthenticated from 'hooks/useAuthenticated';
import useToggle from 'hooks/useToggle';

import FormLogin from 'components/shared/FormLogin';
import FormSignup from 'components/shared/FormSignup';
import RememberMeOption from 'components/shared/RememberMeOption';
import SocialSigninSection from 'components/shared/SocialSigninSection';

export default function LoginSignup({ children, onLoggedIn }) {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const authenticated = useAuthenticated();
  const [rememberMe, toggleRememberMe] = useToggle();

  if (children.length > 1) {
    throw new Error('LoginSignup Modal cannot be used on multiple children');
  }

  // TriggerComponent is usually a button - clone it to run
  // our onClick to open the modal instead of its onClick if user not logged in
  const trigger = React.cloneElement(children, {
    onClick: (e) => {
      const childOnClick = children.props.onClick;

      if (authenticated) {
        _.isFunction(childOnClick) && childOnClick(e);
      } else {
        setModalIsOpen(true);
      }
    }
  });

  return (
    <Modal
      closeIcon
      closeOnEscape
      closeOnDimmerClick
      size="tiny"
      trigger={trigger}
      centered={false}
      open={modalIsOpen}
      onClose={closeModal}
      data-cy="login-signup-modal"
    >
      <Header icon="lock" content="Login or Signup to Save Recipes" />
      <Modal.Content>
        <Modal.Description>
          <Segment textAlign="center">
            <SocialSigninSection
              rememberMe={rememberMe}
              onLoggedIn={useCallback(handleLogin, [onLoggedIn])}
            />
          </Segment>

          <LoginOrSignupForms
            rememberMe={rememberMe}
            onLogin={useCallback(handleLogin, [onLoggedIn])}
          />

          <RememberMeOption
            rememberMe={rememberMe}
            onRememberMe={toggleRememberMe}
          />
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );

  // handlers

  function closeModal() {
    setModalIsOpen(false);
  }

  function handleLogin() {
    closeModal();
    onLoggedIn();
  }
}

LoginSignup.defaultProps = {
  onLoggedIn: noop
};

LoginSignup.propTypes = {
  children: PropTypes.object.isRequired,
  onLoggedIn: PropTypes.func
};

function LoginOrSignupForms({ rememberMe, onLogin }) {
  const [menuItem, setMenuItem] = useState('login');

  return (
    <>
      <Menu pointing data-cy="auth-method">
        <Menu.Item name="Login" active={menuItem === 'login'} data-cy="login" onClick={setMenuItemTo('login')} />
        <Menu.Item name="Signup" active={menuItem === 'signup'} data-cy="signup" onClick={setMenuItemTo('signup')} />
      </Menu>

      <Segment>
        {menuItem === 'login' && <FormLogin rememberMe={rememberMe} onLogin={onLogin} />}
        {menuItem === 'signup' && <FormSignup onLogin={onLogin} />}
      </Segment>
    </>
  );

  // handlers

  function setMenuItemTo(item) {
    return () => setMenuItem(item);
  }
}

LoginOrSignupForms.defaultProps = {
  rememberMe: false
};

LoginOrSignupForms.propTypes = {
  rememberMe: PropTypes.bool,
  onLogin: PropTypes.func.isRequired
};
