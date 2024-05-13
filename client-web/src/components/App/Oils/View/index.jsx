import _ from 'lodash';
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client';
import { Helmet } from 'react-helmet';
import { Container, Breadcrumb, Grid, Header, Segment, Menu } from 'semantic-ui-react';
import { Link, NavLink, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';

import client from 'client';
import useCurrentUser from 'hooks/useCurrentUser';
import useMedia, { mobile } from 'hooks/useMedia';

import RecipeList from 'components/shared/RecipeList';
import Section from 'components/shared/Section';
import { FormPost, PostsRef } from 'components/shared/Postable';
import { TableFattyAcids, TableProperties, TableSapValues } from 'components/shared/OilProperties';

import recipesQuery from 'queries/recipe/recipes.gql';
import recipesSummaryQuery from 'queries/recipe/recipesSummary.gql';
import oilQuery from 'queries/oil/oil.gql';

import createPostMutation from './createPost.gql';

import './viewOil.styl';


export default function View() {
  const { url, path } = useRouteMatch();
  const { oilId } = useParams();

  const { data: { oil } = {}, loading } = useQuery(oilQuery, {
    variables: { id: oilId }
  });

  const isMobile = useMedia(mobile);
  const columnCount = isMobile ? 1 : 3;

  return (
    <Container className="view-oil view-page">
      <Helmet
        title={`${oil?.name} - Soapee`}
      />

      <Bread oil={oil} />

      <Section loading={loading}>
        <Header dividing><OilName oil={oil} /></Header>

        <Grid columns={columnCount}>
          <Grid.Column>
            <TableFattyAcids oil={oil} />
          </Grid.Column>

          <Grid.Column>
            <TableProperties oil={oil} />
          </Grid.Column>

          <Grid.Column>
            <TableSapValues oil={oil} />
          </Grid.Column>
        </Grid>

        <Menu pointing>
          <Menu.Item exact name="Posts" as={NavLink} to={url} />
          <Menu.Item name="Used in Recipes" as={NavLink} to={`${url}/recipes`} />
        </Menu>

        <Switch>
          <Route exact path={path}><Posts oil={oil} /></Route>
          <Route path={`${path}/recipes`} component={Recipes} />
        </Switch>

      </Section>
    </Container>
  );
}

function Bread({ oil }) {
  return (
    <Segment>
      <Breadcrumb>
        <Breadcrumb.Section as={Link} to="/">Home</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section as={Link} to="/oils">Oils</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section active>
          <OilName oil={oil} />
        </Breadcrumb.Section>
      </Breadcrumb>
    </Segment>
  );
}

Bread.defaultProps = {
  oil: null
};

Bread.propTypes = {
  oil: PropTypes.object
};

function Posts({ oil }) {
  const currentUser = useCurrentUser();
  const postsRef = useRef();

  return (
    <div className="oil-posts-container">
      {oil && (
        <PostsRef
          postableId={oil.id}
          postableType="oils"
          canPost={!(_.isNil(currentUser))}
          ref={postsRef}
        />
      )}

      {oil && (
        <Segment data-cy="create-postable-post">
          <h3>Create a New Post for {oil.name}</h3>
          <FormPost
            onSave={handleSave}
          />
        </Segment>
      )}
    </div>
   );

  function handleSave(values) {
    return client.mutate({
      mutation: createPostMutation,
      variables: {
        input: {
          postableId: oil.id,
          postableType: 'oils',
          title: values.title,
          content: values.content
        }
      }
    })
      .then(({ data: { createPost } }) => createPost)
      .then((createPost) => postsRef.current.addNewPost(createPost));
  }
}

Posts.defaultProps = {
  oil: null
};

Posts.propTypes = {
  oil: PropTypes.object
};

function OilName({ oil }) {
  return _.chain(oil).get('name').capitalize().value();
}

function Recipes() {
  const { oilId } = useParams();

  const variables = {
    search: {
      oilIds: [oilId]
    }
  };

  const summaryQuery = {
    variables,
    query: recipesSummaryQuery,
    dataKey: 'recipesSummary'
  };

  const itemsQuery = {
    variables,
    query: recipesQuery,
    dataKey: 'recipes'
  };

  return (
    <div className="oil-recipes">
      <RecipeList
        variables={variables}
        summaryQuery={summaryQuery}
        itemsQuery={itemsQuery}
      />
    </div>
  );
}
