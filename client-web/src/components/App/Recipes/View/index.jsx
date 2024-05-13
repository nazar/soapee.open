import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Container,
  Segment,
  Breadcrumb,
  Header,
  Divider,
  Grid,
  Icon,
  Menu,
  Image
} from 'semantic-ui-react';
import { Link, NavLink, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useQuery } from '@apollo/client';
import cx from 'clsx';

import client from 'client';
import { errorHasExceptionCode } from 'services/apollo';

import useCurrentUser from 'hooks/useCurrentUser';
import useMedia, { mobile } from 'hooks/useMedia';

import AuthenticatedWrapper from 'components/shared/AuthenticatedWrapper';
import BestRecipe from 'components/shared/Buttons/BestRecipe';
import Commentable from 'components/shared/Commentable';
import Comments from 'components/shared/StatLabels/Comments';
import Favourite from 'components/shared/Buttons/Favourite';
import Favourites from 'components/shared/StatLabels/Favourites';
import GAEventReporter from 'components/shared/GAEventReporter';
import LoginSignupModal from 'components/shared/Modals/LoginSignup';
import Placeholder from 'components/shared/Placeholder';
import Reactions from 'components/shared/Reactions';
import Report from 'components/shared/Buttons/Report';
import Section from 'components/shared/Section';
import SoapType from 'components/shared/StatLabels/SoapType';
import SubTitle from 'components/shared/SubTitle';
import TimeAgo, { updatedAgo } from 'components/shared/TimeAgo';
import UserInfo from 'components/shared/UserInfo';
import Voteable from 'components/shared/Voteable';

import RenderRecipeProperties from '../components/RenderRecipeProperties';

import recipeDetailQuery from '../queries/recipeDetail.gql';

import RecipeJournals from './components/RecipeJournals';

import './style.styl';


export default function View({ oils }) {
  const { recipeId } = useParams();
  const { loading, data: { recipe } = {}, error, updateQuery, refetch } = useQuery(recipeDetailQuery, {
    variables: { id: recipeId }
  });

  const currentUser = useCurrentUser();

  if (loading) {
    return (
      <Container>
        <Placeholder lines={20} />
      </Container>
    );
  } else if (_.isEmpty(error)) {
    const canModerate = currentUser && _.get(currentUser, 'id') === _.get(recipe, 'userId');

    return (
      <div className="recipe-view view-page">
        <Helmet>
          <title>{recipe?.name} - Soapee</title>
          <meta name="description" content={recipe?.descriptionStr} />
        </Helmet>

        <Container>
          <Bread recipe={recipe} />

          <Segment loading={loading}>
            {!(loading) && (
              <RecipeDetail
                recipe={recipe}
                oils={oils}
                currentUser={currentUser}
                onDoReloadRecipe={handleReload}
              />
            )}
          </Segment>

          <RecipeCommentsAndJournals
            recipeId={recipeId}
            canModerate={canModerate}
            onCommented={handleOnCommented}
            onDeletedComment={handleOnDeletedComment}
          />
        </Container>
      </div>
    );
  } else {
    return (
      <div className="recipe-view view-page">
        <RenderErrors errors={error} currentUser={currentUser} onLoggedIn={handleOnLoggedInFromError} />
      </div>
    );
  }

  //

  function handleOnCommented() {
    updateQuery(prev => ({
      recipe: {
        ...prev.recipe,
        stats: {
          ...(prev.recipe.stats || {}),
          comments: {
            ...prev.recipe.stats.comments,
            comments: _.get(prev.recipe, 'stats.comments.comments', 0) + 1
          }
        }
      }
    }));
  }

  function handleOnLoggedInFromError() {
    return refetch()
      .catch(() => {
        // noop
      });
  }

  function handleOnDeletedComment() {
    updateQuery(prev => ({
      recipe: {
        ...prev.recipe,
        stats: {
          ...(prev.recipe.stats || {}),
          comments: {
            ...prev.recipe.stats.comments,
            comments: _.max([_.get(prev.recipe, 'stats.comments.comments', 0) - 1, 0])
          }
        }
      }
    }));
  }

  function handleReload() {
    return refetch();
  }
}

function RecipeCommentsAndJournals({ recipeId, canModerate, onCommented, onDeletedComment }) {
  const { url } = useRouteMatch();

  return (
    <div className="comments-and-journals-section" data-cy="comments-and-journals-section">
      <Menu stackable>
        <Menu.Item exact name="Recipe Comments" as={NavLink} to={url} />
        <Menu.Item name="Journal Entries" as={NavLink} to={`${url}/journals`} />
      </Menu>

      <Switch>
        <Route path={`${url}/journals`}>
          <RecipeJournals
            recipeId={recipeId}
            canAddJournal={canModerate}
          />
        </Route>

        <Route path={url}>
          <RecipeComments
            recipeId={recipeId}
            canModerate={canModerate}
            onCommented={onCommented}
            onDeletedComment={onDeletedComment}
          />
        </Route>
      </Switch>
    </div>
  );
}

RecipeCommentsAndJournals.defaultProps = {
  canModerate: false
};

RecipeCommentsAndJournals.propTypes = {
  recipeId: PropTypes.string.isRequired,
  canModerate: PropTypes.bool,
  onCommented: PropTypes.func.isRequired,
  onDeletedComment: PropTypes.func.isRequired
};

function RecipeComments({ recipeId, canModerate, onCommented, onDeletedComment }) {
  return (
    <Commentable
      canComment
      canModerate={canModerate}
      commentableId={recipeId}
      commentableType="recipes"
      onCommented={onCommented}
      onDeletedComment={onDeletedComment}
    />
  );
}

RecipeComments.defaultProps = {
  canModerate: false
};

RecipeComments.propTypes = {
  recipeId: PropTypes.string.isRequired,
  canModerate: PropTypes.bool,
  onCommented: PropTypes.func.isRequired,
  onDeletedComment: PropTypes.func.isRequired
};

function RenderErrors({ errors, currentUser, onLoggedIn }) {
  return (
    <Container>
      {_.map(errors.graphQLErrors, error => (
        <Segment placeholder key={error.extensions?.code}>
          <Header icon>
            <Icon name="stop circle outline" color="red" />
            {error.message}
          </Header>

          {error.extensions?.exception?.subtitle && (
            <Segment.Inline>
              <p>
                {error.extensions.exception.subtitle}
              </p>
              <p>&nbsp;</p>
            </Segment.Inline>
          )}

          <Segment.Inline>
            <Button primary as="a" href="/recipes">Back to Recipes</Button>
          </Segment.Inline>

          {_.isEmpty(currentUser) && errorHasExceptionCode(errors, 'private_recipe') && (
            <Segment.Inline className="option-login">
              <Segment.Inline>
                <Header icon>
                  Login expired. If this is your recipe click the Login button to view your recipe.
                </Header>
              </Segment.Inline>

              <Segment.Inline>
                <LoginSignupModal onLoggedIn={onLoggedIn}>
                  <Button primary>
                    Login
                  </Button>
                </LoginSignupModal>
              </Segment.Inline>
            </Segment.Inline>
          )}
        </Segment>
      ))}
    </Container>
  );
}

RenderErrors.defaultProps = {
  errors: null,
  currentUser: null
};

RenderErrors.propTypes = {
  errors: PropTypes.array,
  currentUser: PropTypes.object,
  onLoggedIn: PropTypes.func.isRequired
};

function RecipeDetail({ recipe, oils, currentUser, onDoReloadRecipe }) {
  const isMyRecipe = recipe.userId === currentUser?.id;

  return (
    <div className="recipe" data-cy="recipe">
      <Grid columns={2} divided>
        <Grid.Column stretched only="computer tablet" computer={1} tablet={2}>
          <Grid>
            <Grid.Row stretched centered>
              <Grid.Column>
                <Voteable
                  voteable={recipe}
                  voteableType="recipes"
                  onVoted={handleReloadRecipe}
                />
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column textAlign="center" verticalAlign="bottom">
                <SoapType recipe={recipe} size="tiny" />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Grid.Column>

        <Grid.Column only="mobile" mobile={16}>
          <Grid divided celled columns={2}>
            <Grid.Column>
              <Voteable
                voteable={recipe}
                voteableType="recipes"
                onVoted={handleReloadRecipe}
              />
            </Grid.Column>

            <Grid.Column textAlign="center" verticalAlign="middle">
              <SoapType recipe={recipe} size="tiny" />
            </Grid.Column>
          </Grid>
        </Grid.Column>

        <Grid.Column stretched computer={15} tablet={14} mobile={16}>
          <RecipeHeading recipe={recipe} />
          <RecipeImage recipe={recipe} />
          <Description recipe={recipe} />
          <Notes recipe={recipe} />

          <Reactions
            className="recipe-view-reactions"
            reactions={recipe.reactions}
            reactionableId={recipe.id}
            reactionableType='recipes'
            onReaction={onDoReloadRecipe}
          />

          <Divider />
          <Properties recipe={recipe} oils={oils} isMyRecipe={isMyRecipe} />
          <Divider />
          <Footer recipe={recipe} currentUser={currentUser} />
        </Grid.Column>
      </Grid>
    </div>
  );

  function handleReloadRecipe() {
    return reloadRecipe(recipe);
  }
}

RecipeDetail.defaultProps = {
  currentUser: null
};

RecipeDetail.propTypes = {
  recipe: PropTypes.object.isRequired,
  oils: PropTypes.array.isRequired,
  currentUser: PropTypes.object,
  onDoReloadRecipe: PropTypes.func.isRequired
};

function RecipeHeading({ recipe }) {
  return (recipe && (
    <Header as="h1">
      <Header.Content>
        {_.get(recipe, 'name')}
      </Header.Content>

      {recipe?.fromRecipe && (
        <Header.Subheader>
          <SubTitle>
            <div className="copied-from" data-cy="copied-from">
              Copied from Recipe &nbsp;
              <Link to={`/recipes/${recipe.fromRecipe.id}`}>{recipe.fromRecipe.name}</Link>
            </div>
          </SubTitle>
        </Header.Subheader>
      )}

      <Header.Subheader>
        <SubTitle>
          <div className="post-info">
            Recipe by &nbsp;
            <UserInfo user={recipe.user} />&nbsp;
            <TimeAgo date={recipe.createdAt} data-cy="recipe-created-at" />&nbsp;
            {recipe.createdAt !== recipe.updatedAt && (
              <TimeAgo
                date={recipe.updatedAt}
                data-cy="recipe-updated-at"
                render={updatedAgo}
              />
            )}
          </div>
        </SubTitle>
      </Header.Subheader>
    </Header>
  )) || null;
}

function RecipeImage({ recipe }) {
  if (recipe?.recipeImage) {
    return (
      <div data-cy="recipe-image">
        <Image
          rounded
          className="recipe-image"
          src={recipe.recipeImage}
        />
      </div>
    );
  } else {
    return null;
  }
}

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
      <Header as="h4">Notes</Header>
      <div dangerouslySetInnerHTML={{ __html: notes }} />
    </>
  )) || null;
}

function Properties({ recipe, oils, isMyRecipe }) {
  return (
    <div>
      {oils && <RenderRecipeProperties recipe={recipe} oils={oils} isMyRecipe={isMyRecipe} />}
    </div>
  );
}

Properties.defaultProps = {
  oils: null,
  isMyRecipe: false
};

Properties.propTypes = {
  recipe: PropTypes.object.isRequired,
  oils: PropTypes.array,
  isMyRecipe: PropTypes.bool
};

function Footer({ recipe, currentUser }) {
  const isMobile = useMedia(mobile);
  const rowAlignment = isMobile ? 'top' : 'middle';

  return (
    <Section className="footer">
      <Grid>
        <Grid.Row verticalAlign={rowAlignment}>
          <Stats recipe={recipe} currentUser={currentUser} isMobile={isMobile} />
          <Actions recipe={recipe} currentUser={currentUser} isMobile={isMobile} />
        </Grid.Row>
      </Grid>
    </Section>
  );
}

Footer.defaultProps = {
  currentUser: null
};

Footer.propTypes = {
  recipe: PropTypes.object.isRequired,
  currentUser: PropTypes.object
};

function Stats({ recipe, isMobile }) {
  const classNames = cx('stats', { 'is-mobile': isMobile });

  return (
    <Grid.Column width={5} className={classNames}>
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

function Actions({ recipe, currentUser, isMobile }) {
  const isAdmin = currentUser?.isAdmin;
  const myRecipe = _.get(recipe, 'userId') === _.get(currentUser, 'id');
  const classNames = cx('actions', { 'is-mobile': isMobile });

  return (
    <Grid.Column width={11} textAlign="right" className={classNames}>
      <AuthenticatedWrapper>
        <Favourite
          favouriteable={recipe}
          favouriteableType="recipes"
          onFavourited={handleReloadRecipe}
        />
      </AuthenticatedWrapper>

      {recipe && myRecipe && (
        <GAEventReporter
          category="Recipes"
          action="editRecipeFromView"
        >
          <Button size="mini" as={Link} to={`/recipes/${recipe.id}/edit`}>Edit</Button>
        </GAEventReporter>
      )}

      {recipe && (
        <GAEventReporter
          category="Recipes"
          action="copyRecipeFromView"
        >
          <Button size="mini" as={Link} to={`/recipes/${recipe.id}/copy`} data-cy="recipe-copy">Copy</Button>
        </GAEventReporter>
      )}

      {recipe && (
        <GAEventReporter
          category="Recipes"
          action="printRecipeFromView"
        >
          <Button size="mini" as={Link} to={`/recipes/${recipe.id}/print`}>Print</Button>
        </GAEventReporter>
      )}

      {recipe && (
        <GAEventReporter
          category="Recipes"
          action="printPreviewRecipeFromView"
        >
          <Button size="mini" as={Link} to={`/recipes/${recipe.id}/print?preview=true`}>Print preview</Button>
        </GAEventReporter>
      )}

      <AuthenticatedWrapper>
        {recipe && !(myRecipe) && (
          <Report
            reportable={recipe}
            reportableType="recipes"
            onReported={handleReloadRecipe}
          />
        )}
      </AuthenticatedWrapper>

      {isAdmin && (
        <BestRecipe
          recipe={recipe}
        />
      )}
    </Grid.Column>
  );

  function handleReloadRecipe() {
    return reloadRecipe(recipe);
  }
}

Actions.defaultProps = {
  currentUser: null,
  isMobile: false
};

Actions.propTypes = {
  recipe: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
  isMobile: PropTypes.bool
};


function Bread({ recipe }) {
  return (
    <Segment>
      <Breadcrumb>
        <Breadcrumb.Section as={Link} to="/">Home</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section as={Link} to="/recipes">Recipes</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section active>
          {_.get(recipe, 'name')}
        </Breadcrumb.Section>
      </Breadcrumb>
    </Segment>
  );
}

Bread.propTypes = {
  recipe: PropTypes.object.isRequired
};

function reloadRecipe(recipe) {
  return client
    .query({
      query: recipeDetailQuery,
      variables: { id: recipe.id },
      fetchPolicy: 'network-only'
    });
}
