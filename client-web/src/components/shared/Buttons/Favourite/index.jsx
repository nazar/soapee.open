import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Bluebird from 'bluebird';
import { Button } from 'semantic-ui-react';

import client from 'client';

import GAEventReporter from 'components/shared/GAEventReporter';

import toggleFavouriteMutation from './toggleFavourite.gql';

export default function Favourite({ favouriteable, favouriteableType, onFavourited }) {
  const [saving, setSaving] = useState(false);
  const isFavourite = _.has(favouriteable, 'myFavourite.id');
  const caption = isFavourite ? 'Favourited' : 'Favourite';

  return (
    <GAEventReporter
      category="Polymorphic"
      action="favourite"
      label={favouriteableType}
      value={Number(favouriteable.id)}
    >
      <Button
        active={isFavourite}
        size="mini"
        loading={saving}
        onClick={favourite}
        data-cy="favourite-button"
      >
        {caption}
      </Button>
    </GAEventReporter>
  );

  //

  function favourite() {
    setSaving(true);

    return Bluebird.resolve(client
      .mutate({
        mutation: toggleFavouriteMutation,
        variables: {
          input: {
            favouriteableId: favouriteable.id,
            favouriteableType
          }
        }
      }))
      .then(({ data: { toggleFavourite } }) => toggleFavourite)
      .then((toggleFavourite) => {
        setSaving(false);
        onFavourited(toggleFavourite);
      })
      .tapCatch(() => setSaving(false));
  }
}

Favourite.propTypes = {
  favouriteable: PropTypes.object.isRequired,
  favouriteableType: PropTypes.string.isRequired,
  onFavourited: PropTypes.func.isRequired
};
