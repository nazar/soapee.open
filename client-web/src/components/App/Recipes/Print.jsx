import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';

import RecipePrint from 'components/shared/RecipeComponents/RecipePrint';

import usePrint from 'hooks/usePrint';

import recipeDetailQuery from './queries/recipeDetail.gql';

export default function Print({ oils }) {
  const { recipeId } = useParams();

  const { data: { recipe } = {} } = useQuery(recipeDetailQuery, {
    variables: { id: recipeId }
  });

  usePrint({ recipe });

  return (
    <div className="recipe-print">
      <Helmet
        title={`${_.get(recipe, 'name')} - Soapee`}
      />

      {recipe && <RecipePrint oils={oils} recipe={recipe} />}
    </div>
  );
}

Print.propTypes = {
  oils: PropTypes.array.isRequired
};
