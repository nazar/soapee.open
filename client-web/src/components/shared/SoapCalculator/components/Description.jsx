import React from 'react';
import PropTypes from 'prop-types';

import { Input, RichEdit, ErrorMessage } from 'components/shared/Form';

export default function Description({ register }) {
  return (
    <div>
      <Input
        fluid
        label="Recipe Name"
        placeholder="Enter recipe name..."
        name="name"
        register={register}
        data-cy="recipe-name"
      />
      <ErrorMessage register={register} name="name" />

      <RichEdit
        id="recipe-description"
        label="Recipe Description"
        placeholder="Enter Recipe description..."
        name="description"
        register={register}
        data-cy="recipe-description"
      />

      <RichEdit
        id="recipe-notes"
        label="Recipe Notes / Preparation method / Instructions"
        placeholder="Describe how the recipe is prepared; mention anything interesting or relevant to this recipe"
        name="notes"
        register={register}
        data-cy="recipe-notes"
      />
    </div>
  );
}

Description.propTypes = {
  register: PropTypes.object.isRequired
};
