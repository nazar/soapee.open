import React from 'react';
import { Divider, Header, Segment, Message } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import FormSignup from 'components/shared/FormSignup';
import SocialSigninSection from 'components/shared/SocialSigninSection';


export default function Signup() {
  return (
    <div>
      <Header as="h2" textAlign="center" color="grey">
        Signup using your Social Account
      </Header>

      <Segment>
        <SocialSigninSection />
      </Segment>

      <Divider horizontal>Or</Divider>

      <Header as="h2" textAlign="center" color="grey">
        Create a Free Soapee Account
      </Header>

      <Segment>
        <FormSignup />
      </Segment>

      <Message>
        Already Have an account? <Link to="/auth/login">Login</Link>
      </Message>
    </div>
  );
}
