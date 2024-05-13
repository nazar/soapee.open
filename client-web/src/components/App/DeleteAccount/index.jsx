import React from 'react';
import { Container, Header } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import DeleteAccountDescription from 'components/shared/DeleteAccountDescription';

export default function DeleteAccount() {
  return (
    <Container className="view-page">
      <Header as="h1">Account Deletion</Header>

      <Header>How do I delete my account?</Header>
      <p>
        Please <Link to="/auth/login">Login</Link> into Soapee, if you have not done so, and visit your{' '}
        <Link to="/settings">Settings</Link> page.
      </p>
      <p>
        Click the <strong>Delete My Account</strong> button to delete your profile details.
      </p>

      <DeleteAccountDescription />
    </Container>
  );
}
