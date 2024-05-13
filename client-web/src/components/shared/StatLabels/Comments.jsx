import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Label, Popup } from 'semantic-ui-react';

export default function Comments({ statable, showTooltip = false, tooltip = 'Number of Comments' }) {
  const comments = _.get(statable, 'stats.comments.comments', 0);

  const label = <TheLabel comments={comments} />;

  if (showTooltip) {
    return (
      <Popup
        trigger={label}
        content={tooltip}
      />
    );
  } else {
    return label;
  }
}

function TheLabel({ comments, ...rest }) {
  return <Label data-cy="stats-label-comments" {...rest}><Icon name="comment" />{comments}</Label>;
}

TheLabel.propTypes = {
  comments: PropTypes.string.isRequired
};
