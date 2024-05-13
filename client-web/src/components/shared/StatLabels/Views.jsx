import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Label, Popup } from 'semantic-ui-react';

export default function Views({ statable, showTooltip = false, tooltip = 'Number of Views' }) {
  const views = _.get(statable, 'stats.views.count', 0);

  if (showTooltip) {
    return (
      <Popup
        trigger={<TheLabel views={views} />}
        content={tooltip}
      />
    );
  } else {
    return <TheLabel views={views} />;
  }
}

function TheLabel({ views, ...rest }) {
  return <Label data-cy="stats-label-views" {...rest}><Icon name="eye" />{views}</Label>;
}

TheLabel.propTypes = {
  views: PropTypes.number.isRequired
};
