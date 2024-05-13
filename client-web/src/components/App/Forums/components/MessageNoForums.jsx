import React from 'react';
import { Message } from 'semantic-ui-react';

import LoginModalLink from 'components/shared/LoginModalLink';

export default function MessageNoForums() {
  return (
    <Message
      icon="comments outline"
      header="No Results"
      content={(
        <>
          No User Forums yet. Be the first to{' '}
          <LoginModalLink to="/forums/create">create</LoginModalLink> your own Forum.
        </>
      )}
    />
  );
}
