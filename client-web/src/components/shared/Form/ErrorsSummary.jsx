import _ from 'lodash';
import React from 'react';
import { Message } from 'semantic-ui-react';


export default function ErrorsSummary({ header, errors }) {
  const stringErrors = _.map(errors, 'message');

  if (_.isEmpty(stringErrors)) {
    return null;
  } else {
    return (
      <Message
        error
        visible
        header={header}
        list={stringErrors}
      />
    );
  }
}
