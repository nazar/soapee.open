import React from 'react';
import { Container, Header } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import DeleteAccountDescription from 'components/shared/DeleteAccountDescription';

export default function PrivacyPolicy() {
  return (
    <Container className="view-page">
      <Header as="h1">Privacy Policy</Header>

      <Header>Information that is gathered from visitors</Header>
      <p>In common with other websites, log files are stored on the web server saving details such as the visitor's IP
        address, browser type, referring page and time of visit.
      </p>

      <p>
        Cookies are used to remember visitor preferences when interacting with the website.
        Cookies are further used by Google Analytics to track page views.
      </p>

      <p>
        Where registration is required, the visitor's email, if provided, and a username will be stored on the server.
      </p>

      <Header>How the Information is used</Header>
      <p>The information is used to enhance the visitor's experience when using the website to display personalised
        content.
      </p>

      <p>E-mail addresses will not be sold, rented or leased to 3rd parties.</p>

      <p>E-mail will be used for the purpose of password recovery and for opt-it notifications.</p>

      <Header>Visitor Options</Header>

      <p>You may be able to block cookies via your browser settings but this may prevent you from access to certain
        features of the website.
      </p>

      <Header>Cookies</Header>
      <p>Cookies are small digital signature files that are stored by your web browser that allow your preferences to
        be recorded when visiting the website. Also they may be used to track your return visits to the website.
      </p>

      <Header>Account Deletion</Header>

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
