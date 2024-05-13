import _ from 'lodash';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button, Container, Header, Divider, Message, Segment } from 'semantic-ui-react';
import { useHistory } from 'react-router-dom';

import useRecipeToOilsAdditivesAndSummary from 'hooks/useRecipeToOilsAdditivesAndSummary';

import UserInfo from 'components/shared/UserInfo';
import TimeAgo, { updatedAgo } from 'components/shared/TimeAgo';
import SubTitle from 'components/shared/SubTitle';

import AdditiveBreakdown from 'components/shared/RecipeComponents/AdditiveBreakdown';
import OilBreakdown from 'components/shared/RecipeComponents/OilBreakdown';
import RecipeTotals from 'components/shared/RecipeComponents/RecipeTotals';
import RecipeProperties from 'components/shared/RecipeComponents/RecipeProperties';
import RecipeFattyAcids from 'components/shared/RecipeComponents/RecipeFattyAcids';

import './recipePrint.styl';

export default function RecipePrint({ recipe, oils }) {
  return (
    <div className="recipe-print-container">
      <Container>
        <Segment>
          <BackButton />
          <Heading recipe={recipe} />
          <Description recipe={recipe} />
          <Notes recipe={recipe} />
          <Divider />
          <RenderRecipeProperties oils={oils} recipe={recipe} />
        </Segment>
      </Container>
    </div>
  );
}

function Heading({ recipe }) {
  return (recipe && (
    <Header as="h1">
      <Header.Content>
        {_.get(recipe, 'name')}
      </Header.Content>

      {recipe.user && (
        <Header.Subheader>
          <SubTitle>
            <div className="post-info">
              Recipe by &nbsp;
              <UserInfo user={recipe.user} />&nbsp;
              <TimeAgo date={recipe.createdAt} />&nbsp;
              <TimeAgo
                date={recipe.updatedAt}
                render={updatedAgo}
              />
            </div>
          </SubTitle>
        </Header.Subheader>
      )}
    </Header>
  )) || null;
}

RecipePrint.propTypes = {
  oils: PropTypes.array.isRequired,
  recipe: PropTypes.object.isRequired
};

function Description({ recipe }) {
  return <div dangerouslySetInnerHTML={{ __html: _.get(recipe, 'description') }} />;
}

Description.propTypes = {
  recipe: PropTypes.object.isRequired
};

function Notes({ recipe }) {
  const notes = _.get(recipe, 'notes');

  return (notes && (
    <>
      <Header as="h2">Notes</Header>
      <div dangerouslySetInnerHTML={{ __html: notes }} />
    </>
  )) || null;
}

function RenderRecipeProperties({ recipe, oils }) {
  const [recipeForDisplay, recipeAdditives] = useRecipeToOilsAdditivesAndSummary({ recipe, oils });

  return (
    <div className="render-recipe-properties">
      <div className="break">
        <Header block attached>Oil Breakdown</Header>
        <OilBreakdown attached printable recipe={recipeForDisplay} />
      </div>

      {!(_.isEmpty(recipeAdditives)) && (
        <div className="break">
          <Header block attached>Additives</Header>
          <AdditiveBreakdown attached printable recipeAdditives={recipeAdditives} />
        </div>
      )}

      <div className="div break">
        <Header block attached>Recipe Totals</Header>
        <RecipeTotals attached printable recipe={recipeForDisplay} />
      </div>

      <div className="break">
        <Header block attached="top">Recipe Properties</Header>
        <div className="split-container">
          <div className="left">
            <RecipeProperties
              attached
              withRange
              printable
              recipe={recipeForDisplay}
            />
          </div>

          <div className="right">
            <Header block attached="top">Fatty Acids %</Header>
            <RecipeFattyAcids
              attached
              printable
              recipe={recipeForDisplay}
            />
          </div>
          <div className="clear">&nbsp;</div>
        </div>
      </div>
    </div>
  );
}

RenderRecipeProperties.propTypes = {
  oils: PropTypes.array.isRequired,
  recipe: PropTypes.object.isRequired
};

function BackButton() {
  const history = useHistory();

  return (
    <Message className="back-message">
      <Button onClick={useCallback(() => history.goBack(), [history])}>Back to recipe</Button>
    </Message>
  );
}
