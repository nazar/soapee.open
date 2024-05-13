import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Container, Icon, Message } from 'semantic-ui-react';

import TooltipQuestion from 'components/shared/TooltipQuestion';

export default function RememberMeOption({ rememberMe, onRememberMe }) {
  return (
    <Container textAlign="left">
      <Message size="small" icon>
        <Icon name="user" />
        <Message.Content>
          <Checkbox
            label={<RememberMeCheckboxLabel />}
            checked={rememberMe}
            data-cy="remember-me"
            onChange={onRememberMe}
          />
        </Message.Content>
      </Message>
    </Container>
  );
}

RememberMeOption.defaultProps = {
  rememberMe: false
};

RememberMeOption.propTypes = {
  rememberMe: PropTypes.bool,
  onRememberMe: PropTypes.func.isRequired
};

function RememberMeCheckboxLabel(props) {
  return (
    <label {...props}>
      <strong>Remember Me</strong>
      &nbsp;
      <TooltipQuestion>
        <p>
          Check the <strong>Remember Me</strong> option to remember your login for 30 days on this device.
        </p>
        <p>
          Uncheck the <strong>Remember Me</strong> option to forget your login when you close the browser.
        </p>
        <p>
          Please <strong>do not</strong> check the <strong>Remember Me</strong> option when accessing Soapee from a
          public workstation.
        </p>
        <p>
          The <strong>Remember Me</strong> option applies to Google and Password Username logins.
        </p>
      </TooltipQuestion>
    </label>
  );
}
