import React from 'react';
import { Container, Message, Icon, Segment, Header } from 'semantic-ui-react';

import './style.styl';


export default class SentryErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  componentDidCatch(error) {
    this.setState({ error });
  }

  render() {
    const { error } = this.state;
    const { children } = this.props;

    if (error) {
      // FIXME consider uploading this to an API endpoint
      // eslint-disable-next-line no-console
      console.log('error', error);

      return (
        <Container className="error-message-content-component">
          <div className="content-container">
            <Segment placeholder className="content-error">
              <Header icon>
                <Icon name="stop circle outline" />
                Oops - something went wrong 😲
              </Header>

              <Segment.Inline>
                <Message
                  negative
                  content={<ErrorMessageContent />}
                />
              </Segment.Inline>
            </Segment>
          </div>
        </Container>
      );
    } else {
      return children;
    }
  }
}

function ErrorMessageContent(props) {
  return (
    <div className="error-message-content-component">
      <p {...props}>
        Looks like something went wrong <span role="img" aria-label="thinking">🤔</span>.
      </p>
      <p>Please try reloading this page to see if the error goes away as this might be related to a Soapee update.</p>
      <p>
        If this issue persists, please report this issue to our <a href="/forums/2">help</a> or <a href="/forums/10">issues</a> forums and I&apos;ll look into it ASAP.
      </p>
      <p>
        Please provide as much detail as possible on how to reproduce this issue as this will enable me to quicker find and fix the issue.
      </p>
      <p>
        Thank you for your help and patience.
      </p>
      <p>
        Soapee.
      </p>
    </div>
  );
}
