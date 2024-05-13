import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Segment, Grid, Header, Divider, Message, Image } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import cx from 'clsx';

import client from 'client';

import usePaginator from 'hooks/usePaginator';
import useMedia, { mobile } from 'hooks/useMedia';
import { createdAtAndUpdatedAtDiffer } from 'services/time';

import Reactions from 'components/shared/Reactions';
import Section from 'components/shared/Section';
import Voteable from 'components/shared/Voteable';
import TimeAgo from 'components/shared/TimeAgo';
import UserInfo from 'components/shared/UserInfo';
import Favourites from 'components/shared/StatLabels/Favourites';
import Comments from 'components/shared/StatLabels/Comments';
import SubTitle from 'components/shared/SubTitle';
import AuthenticatedWrapper from 'components/shared/AuthenticatedWrapper';
import BestRecipe from 'components/shared/Buttons/BestRecipe';
import Favourite from 'components/shared/Buttons/Favourite';
import Report from 'components/shared/Buttons/Report';
import DeleteRecipe from 'components/shared/Buttons/DeleteRecipe';
import UberPaginator from 'components/shared/UberPaginator';
import RecipeOrderBar, { defaultOrder } from 'components/shared/RecipeOrderBar';

import SearchBar from './components/SearchBar';

import recipeQuery from './queries/recipe.gql';
import deleteRecipeMutation from './queries/deleteRecipe.gql';

import './style.styl';


export default function RecipeList({
  summaryQuery,
  itemsQuery,
  variables,
  withSearch,
  canDelete,
  isAdmin,
  recipeDefaultOrder,
  NotFoundMessage
} = {}) {
  const [order, setOrder] = useState(recipeDefaultOrder);
  const [search, setSearch] = useState(null);

  const searchToUse = { ...(_.get(variables, 'search') || {}), ...search };

  const queryVariables = {
    ...(variables || {}),
    search: searchToUse,
    order
  };

  const { paginatorProps, items: recipes, loading, updateQuery } = usePaginator({
    summaryQuery: {
      ...summaryQuery,
      variables: {
        ...(summaryQuery.variables || {}),
        search: searchToUse
      }
    },
    itemsQuery: {
      ...itemsQuery,
      variables: { ...(itemsQuery.variables || {}), ...queryVariables }
    }
  });


  return (
    <div className="recipe-list-component">
      {withSearch && (
        <Segment>
          <SearchBar
            onSearch={handleSearch}
          />
        </Segment>
      )}

      {_.get(recipes, 'length') > 0 && (
        <RecipeOrderBar order={order} onChange={setOrder} />
      )}

      <Section basic loading={loading} padded={false}>
        {_.map(recipes, recipe => (
          <Segment key={`recipe-${recipe.id}`}>
            <RecipeSummary recipe={recipe} canDelete={canDelete} isAdmin={isAdmin} onDelete={handleOnDelete} />
          </Segment>
        ))}
      </Section>

      {_.isEmpty(recipes) && !loading && <NotFoundMessage />}

      <UberPaginator {...paginatorProps} />
    </div>
  );

  //

  function handleSearch({ oilIds, name, soapTypes, properties }) {
    if (!(_.isEqual(search, { oilIds, name, soapTypes, properties }))) {
      setSearch({ oilIds, name, soapTypes, properties });
    }
  }

  function handleOnDelete(recipe) {
    return client
      .mutate({
        mutation: deleteRecipeMutation,
        variables: { id: recipe.id }
      })
      .then(() => {
        return updateQuery(prev => ({
          [itemsQuery.dataKey]: _.reject(prev[itemsQuery.dataKey], { id: recipe.id })
        }));
      });
  }
}

RecipeList.defaultProps = {
  recipeDefaultOrder: defaultOrder,
  variables: null,
  withSearch: false,
  canDelete: false,
  isAdmin: false,
  NotFoundMessage: DefaultNotFoundMessage
};

RecipeList.propTypes = {
  summaryQuery: PropTypes.object.isRequired,
  itemsQuery: PropTypes.object.isRequired,
  variables: PropTypes.object,
  withSearch: PropTypes.bool,
  canDelete: PropTypes.bool,
  isAdmin: PropTypes.bool,
  recipeDefaultOrder: PropTypes.object,
  NotFoundMessage: PropTypes.func
};

// private components

function DefaultNotFoundMessage() {
  return (
    <Message icon>
      <Message.Content>
        <Message.Header>Search found no matches</Message.Header>
        Please broaden your search and try again
      </Message.Content>
    </Message>
  );
}


function RecipeSummary({ recipe, canDelete, isAdmin, onDelete }) {
  const isMobile = useMedia(mobile);

  return (
    <div className="recipe" data-cy="recipe-summary" data-cy-recipe-id={recipe.id}>
      {isMobile && (
        <RecipeDetailsMobile
          recipe={recipe}
          canDelete={canDelete}
          isAdmin={isAdmin}
          onDelete={onDelete}
          onDoReloadRecipe={reloadRecipe}
        />
      )}

      {!(isMobile) && (
        <Grid divided columns={2}>
          <Grid.Row>
            <Grid.Column width={1}>
              <Voteable voteable={recipe} voteableType="recipes" onVoted={reloadRecipe} />
            </Grid.Column>

            <Grid.Column width={15}>
              <RecipeDetails
                recipe={recipe}
                canDelete={canDelete}
                isAdmin={isAdmin}
                onDelete={onDelete}
                onDoReloadRecipe={reloadRecipe}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      )}
    </div>
  );

  //


  function reloadRecipe() {
    const recipeId = _.get(recipe, 'id');

    return client
      .query({
        query: recipeQuery,
        variables: { id: recipeId },
        fetchPolicy: 'network-only'
      });
  }
}

RecipeSummary.defaultProps = {
  canDelete: false,
  isAdmin: false
};

RecipeSummary.propTypes = {
  recipe: PropTypes.object.isRequired,
  canDelete: PropTypes.bool,
  isAdmin: PropTypes.bool,
  onDelete: PropTypes.func.isRequired
};

function RecipeDetails({ recipe, canDelete, isAdmin, onDelete, onDoReloadRecipe }) {
  return (
    <div className="recipe-detail">
      {recipe?.recipeImage && (
        <div className="recipe-details-with-image">
          <div className="image-container">
            <Link to={`/recipes/${recipe.id}`}>
              <Image rounded className="recipe-image" src={recipe.recipeImage} />
            </Link>
          </div>

          <div className="details-container">
            <Header sub className="name" as={Link} to={`/recipes/${recipe.id}`}>{recipe.name}</Header>
            <OwnerDetails recipe={recipe} />
          </div>
        </div>
      )}

      {!(recipe?.recipeImage) && (
        <>
          <Header sub className="name" as={Link} to={`/recipes/${recipe.id}`}>{recipe.name}</Header>
          <OwnerDetails recipe={recipe} />
        </>
      )}

      <Reactions
        className="recipe-list-reactions"
        reactions={recipe.reactions}
        reactionableId={recipe.id}
        reactionableType='recipes'
        onReaction={onDoReloadRecipe}
      />

      <Divider />

      <Footer
        recipe={recipe}
        canDelete={canDelete || isAdmin}
        isAdmin={isAdmin}
        onDelete={onDelete}
        onDoReloadRecipe={onDoReloadRecipe}
      />
    </div>
  );
}

RecipeDetails.defaultProps = {
  canDelete: false,
  isAdmin: false
};

RecipeDetails.propTypes = {
  recipe: PropTypes.object.isRequired,
  canDelete: PropTypes.bool,
  isAdmin: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
  onDoReloadRecipe: PropTypes.func.isRequired
};

function RecipeDetailsMobile({ recipe, canDelete, onDelete, onDoReloadRecipe }) {
  return (
    <div className="recipe-detail-mobile">
      <Grid divided columns={2}>
        <Grid.Column width={2}>
          <Voteable voteable={recipe} voteableType="recipes" onVoted={onDoReloadRecipe} />
        </Grid.Column>

        <Grid.Column width={14}>
          <Header sub className="name" as={Link} to={`/recipes/${recipe.id}`}>{recipe.name}</Header>

          {recipe?.recipeImage && (
            <div className="image-container-mobile">
              <Link to={`/recipes/${recipe.id}`}>
                <Image rounded className="recipe-image" src={recipe.recipeImage} />
              </Link>
            </div>
          )}

          <OwnerDetails recipe={recipe} />

          <Reactions
            className="recipe-list-reactions"
            reactions={recipe.reactions}
            reactionableId={recipe.id}
            reactionableType='recipes'
            onReaction={onDoReloadRecipe}
          />
        </Grid.Column>
      </Grid>

      <Divider />

      <Footer isMobile recipe={recipe} canDelete={canDelete} onDelete={onDelete} onDoReloadRecipe={onDoReloadRecipe} />
    </div>
  );
}

RecipeDetailsMobile.defaultProps = {
  canDelete: false
};

RecipeDetailsMobile.propTypes = {
  recipe: PropTypes.object.isRequired,
  canDelete: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
  onDoReloadRecipe: PropTypes.func.isRequired
};

function OwnerDetails({ recipe }) {
  return (
    <SubTitle>
      <div className="recipe-info">
        Recipe by &nbsp;
        <UserInfo user={recipe.user} /> &nbsp;
        <TimeAgo date={recipe.createdAt} /> &nbsp;
        {createdAtAndUpdatedAtDiffer(recipe) && (
          <>
            - updated <TimeAgo date={recipe.updatedAt} />
          </>
        )}
      </div>
    </SubTitle>
  );
}

OwnerDetails.propTypes = {
  recipe: PropTypes.object.isRequired
};

function Footer({ recipe, isMobile, canDelete, isAdmin, onDelete, onDoReloadRecipe }) {
  const alignment = isMobile ? 'top' : 'middle';

  return (
    <Section className="footer">
      <Grid>
        <Grid.Row verticalAlign={alignment}>
          <Stats recipe={recipe} isMobile={isMobile} />
          <Actions
            recipe={recipe}
            isMobile={isMobile}
            canDelete={canDelete}
            isAdmin={isAdmin}
            onDelete={onDelete}
            onDoReloadRecipe={onDoReloadRecipe}
          />
        </Grid.Row>
      </Grid>
    </Section>
  );
}

Footer.defaultProps = {
  isMobile: false,
  canDelete: false,
  isAdmin: false
};

Footer.propTypes = {
  recipe: PropTypes.object.isRequired,
  isMobile: PropTypes.bool,
  canDelete: PropTypes.bool,
  isAdmin: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
  onDoReloadRecipe: PropTypes.func.isRequired
};

function Stats({ recipe, isMobile }) {
  const classNames = cx('stats', { 'is-mobile': isMobile });

  return (
    <Grid.Column width={8} className={classNames}>
      <Comments statable={recipe} />
      <Favourites statable={recipe} />
    </Grid.Column>
  );
}

Stats.defaultProps = {
  isMobile: false
};

Stats.propTypes = {
  recipe: PropTypes.object.isRequired,
  isMobile: PropTypes.bool
};

function Actions({ recipe, isMobile, isAdmin, canDelete, onDelete, onDoReloadRecipe }) {
  const classNames = cx('actions', { 'is-mobile': isMobile });

  return (
    <Grid.Column width={8} textAlign="right" className={classNames}>
      <AuthenticatedWrapper>
        <Favourite
          favouriteable={recipe}
          favouriteableType="recipes"
          onFavourited={onDoReloadRecipe}
        />
      </AuthenticatedWrapper>

      <AuthenticatedWrapper>
        <Report
          reportable={recipe}
          reportableType="recipes"
          onReported={onDoReloadRecipe}
        />
      </AuthenticatedWrapper>

      {canDelete && (
        <DeleteRecipe
          recipeName={recipe.name}
          onDelete={handleDelete}
        />
      )}

      {isAdmin && (
        <BestRecipe
          recipe={recipe}
        />
      )}
    </Grid.Column>
  );

  function handleDelete() {
    return onDelete(recipe);
  }

}

Actions.defaultProps = {
  isMobile: false,
  canDelete: false,
  isAdmin: false
};

Actions.propTypes = {
  recipe: PropTypes.object.isRequired,
  isMobile: PropTypes.bool,
  canDelete: PropTypes.bool,
  isAdmin: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
  onDoReloadRecipe: PropTypes.func.isRequired
};
