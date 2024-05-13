import React from 'react';
import { Button, Container, Header, Icon, Segment } from 'semantic-ui-react';

export default function PageNotFound() {
  return (
    <Container>
      <Segment placeholder>
        <Header icon>
          <Icon name="stop circle outline" color="red" />
          Page Not Found
        </Header>

        <Segment>
          <p>
            The Page you were looking for was not found.
            Soapee was recently updated to Soapee Next and some page links have changed.
          </p>

          <p>
            Please click o the Home button or choose the relevant page from the links at
            the top of the page.
          </p>
        </Segment>

        <Segment.Inline>
          <Button primary as="a" href="/">Home</Button>
        </Segment.Inline>
      </Segment>
    </Container>
  );
}
