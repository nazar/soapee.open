import React from 'react';
import { Header, Segment, Message, Divider } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import useToggle from 'hooks/useToggle';

import FormLogin from 'components/shared/FormLogin';
import RememberMeOption from 'components/shared/RememberMeOption';
import SocialSigninSection from 'components/shared/SocialSigninSection';


export default function Login() {
  const [rememberMe, toggleRememberMe] = useToggle();

  return (
    <div>
      <Header as="h2" textAlign="center" color="grey">
        Sign-in to Soapee
      </Header>

      <Segment>
        <SocialSigninSection rememberMe={rememberMe} />
      </Segment>

      <Divider horizontal>Or</Divider>

      <Header as="h2" textAlign="center" color="grey">
        Log-in to your account
      </Header>

      <Segment>
        <FormLogin rememberMe={rememberMe} />
      </Segment>

      <RememberMeOption
        rememberMe={rememberMe}
        onRememberMe={toggleRememberMe}
      />

      <Message>
        Forgot your Password? <Link to="/auth/forgot">Reset your Password</Link>
      </Message>

      <Message>
        New to us? <Link to="/auth/signup">Sign Up</Link>
      </Message>
    </div>
  );
}
