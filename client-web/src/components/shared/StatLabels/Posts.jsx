import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Label, Popup } from 'semantic-ui-react';

export default function Posts({ statable, showTooltip = false, tooltip = 'Number of Posts' }) {
  const posts = _.get(statable, 'stats.posts.posts', 0);

  if (showTooltip) {
    return (
      <Popup
        trigger={<TheLabel posts={posts} />}
        content={tooltip}
      />
    );
  } else {
    return <TheLabel posts={posts} />;
  }
}

function TheLabel({ posts, ...rest }) {
  return <Label data-cy="stats-label-posts" {...rest}><Icon name="wordpress forms" />{posts}</Label>;
}

TheLabel.propTypes = {
  posts: PropTypes.array.isRequired
};
