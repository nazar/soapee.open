import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Bluebird from 'bluebird';
import { Button } from 'semantic-ui-react';

import client from 'client';
import noop from 'services/noop';

import toggleBestRecipeMutation from './toggleBestRecipe.gql';

export default function BestRecipe({ recipe, onBest }) {
  const [saving, setSaving] = useState(false);
  const isBest = recipe?.best;

  return (
    <Button
      active={isBest}
      size="mini"
      loading={saving}
      onClick={best}
      data-cy="best-button"
    >
      Best
    </Button>
  );

  //

  function best() {
    setSaving(true);

    return Bluebird.resolve(client
      .mutate({
        mutation: toggleBestRecipeMutation,
        variables: {
          id: recipe.id
        }
      }))
      .then(({ data: { toggleBestRecipe } }) => toggleBestRecipe)
      .then((toggleBestRecipe) => {
        setSaving(false);
        onBest(toggleBestRecipe);
      })
      .tapCatch(() => setSaving(false));
  }
}

BestRecipe.defaultProps = {
  onBest: noop
};

BestRecipe.propTypes = {
  recipe: PropTypes.object.isRequired,
  onBest: PropTypes.func
};
