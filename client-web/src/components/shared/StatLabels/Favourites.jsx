import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { Icon, Label } from 'semantic-ui-react';

export default function Favourites({ statable }) {
  const favourites = _.get(statable, 'stats.favourites.favourites', 0);

  return <Label data-cy="stats-label-favourite"><Icon name="star" />{favourites}</Label>;
}

Favourites.propTypes = {
  statable: PropTypes.object.isRequired
};
