import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Label, Popup } from 'semantic-ui-react';

export default function StatSubscribers({ forum, showTooltip = false, tooltip = 'Number of Subscribers' }) {
  const subscriptions = _.get(forum, 'stats.subscriptions', 0);

  if (showTooltip) {
    return (
      <Popup
        trigger={<TheLabel subscriptions={subscriptions} />}
        content={tooltip}
      />
    );
  } else {
    return <TheLabel subscriptions={subscriptions} />;
  }
}

function TheLabel({ subscriptions, ...rest }) {
  return <Label data-cy="stats-label-subscribers" {...rest}><Icon name="user" />{subscriptions}</Label>;
}

TheLabel.propTypes = {
  subscriptions: PropTypes.number.isRequired
};
