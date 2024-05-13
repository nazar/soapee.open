import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Accordion, Grid, Header, Icon } from 'semantic-ui-react';

import useRecipeToOilsAdditivesAndSummary from 'hooks/useRecipeToOilsAdditivesAndSummary';

import AdditiveBreakdown from 'components/shared/RecipeComponents/AdditiveBreakdown';
import OilBreakdown from 'components/shared/RecipeComponents/OilBreakdown';
import RecipeTotals from 'components/shared/RecipeComponents/RecipeTotals';
import RecipeProperties from 'components/shared/RecipeComponents/RecipeProperties';
import RecipeFattyAcids from 'components/shared/RecipeComponents/RecipeFattyAcids';

export default function RenderRecipeProperties({ recipe, oils, isMyRecipe }) {
  const [open, setOpen] = useState(false);
  const [recipeForDisplay, recipeAdditives] = useRecipeToOilsAdditivesAndSummary({ recipe, oils });

  return (
    <>
      <Header>Oils</Header>
      <OilBreakdown attached linkable recipe={recipeForDisplay} />

      {!(_.isEmpty(recipeAdditives)) && (
        <>
          <Header>Additives</Header>
          <AdditiveBreakdown attached linkable={isMyRecipe} recipeAdditives={recipeAdditives} />
        </>
      )}

      <Accordion>
        <Accordion.Title active={open} onClick={toggle}>
          <Icon name="dropdown" />
          <strong>Recipe Details</strong>
        </Accordion.Title>

        <Accordion.Content active={open}>
          {open && <RenderRecipePropertyDetails recipeForDisplay={recipeForDisplay} />}
        </Accordion.Content>
      </Accordion>
    </>
  );

  //

  function toggle() {
    setOpen(prevOpen => !prevOpen);
  }
}

RenderRecipeProperties.defaultProps = {
  isMyRecipe: false
};

RenderRecipeProperties.propTypes = {
  isMyRecipe: PropTypes.bool,
  oils: PropTypes.array.isRequired,
  recipe: PropTypes.object.isRequired
};

function RenderRecipePropertyDetails({ recipeForDisplay }) {
  return (
    <Grid>
      <Grid.Row columns={3}>
        <Grid.Column computer={8} tablet={16} mobile={16}>
          <Header block attached="top">Recipe Totals</Header>
          <RecipeTotals attached recipe={recipeForDisplay} />
        </Grid.Column>

        <Grid.Column only="tablet mobile" tablet={16} mobile={16}>
          &nbsp;
        </Grid.Column>

        <Grid.Column computer={5} tablet={9} mobile={16}>
          <Header block attached="top">Recipe Properties</Header>
          <RecipeProperties
            attached
            withRange
            showTooltips
            recipe={recipeForDisplay}
          />
        </Grid.Column>

        <Grid.Column only="mobile" mobile={16}>
          &nbsp;
        </Grid.Column>

        <Grid.Column computer={3} tablet={7} mobile={16}>
          <Header block attached="top">Fatty Acids %</Header>
          <RecipeFattyAcids
            attached
            showTooltips
            recipe={recipeForDisplay}
          />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

RenderRecipePropertyDetails.propTypes = {
  recipeForDisplay: PropTypes.object.isRequired
};
