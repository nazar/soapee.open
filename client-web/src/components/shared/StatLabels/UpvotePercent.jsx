import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Label } from 'semantic-ui-react';

export default function UpvotePercent({ statable }) {
  const percent = _.get(statable, 'stats.votes.upvotedPercent', 0);
  const count = _.get(statable, 'stats.votes.count', 0);

  return count ? <Label data-cy="stats-label-upvote-percent"><Icon name="caret up" />{percent}%</Label> : null;
}

UpvotePercent.propTypes = {
  statable: PropTypes.object.isRequired
};
