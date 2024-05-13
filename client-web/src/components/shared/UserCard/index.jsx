import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { Header, Icon, Image, Popup, Grid, Card } from 'semantic-ui-react';

import useMedia, { mobile } from 'hooks/useMedia';
import TimeAgo from 'components/shared/TimeAgo';

import fallbackAvatar from './assets/generic.jpg';

export default function UserCard({ user, centered, extraContent }) {
  const [imageSrc, setImageSrc] = useState(user.canonicalImage);
  const isMobile = useMedia(mobile);

  useEffect(() => {
    user.canonicalImage && setImageSrc(user.canonicalImage);
  }, [user.canonicalImage]);

  return (
    <Card centered={centered} fluid={isMobile} data-cy="user-card">
      <Image fluid src={imageSrc} onError={handleNoAvatar} />
      <Card.Content>
        <Card.Header>{user.name}</Card.Header>

        <Card.Meta>
          <span className="date">Joined <TimeAgo date={user.createdAt} /></span>
        </Card.Meta>
      </Card.Content>

      <Card.Description>
        <Karma user={user} />
      </Card.Description>

      {extraContent && (
        <Card.Content extra>
          {extraContent}
        </Card.Content>
      )}
    </Card>
  );

  //

  function handleNoAvatar() {
    setImageSrc(fallbackAvatar);
  }
}

UserCard.defaultProps = {
  centered: false,
  extraContent: null
};

UserCard.propTypes = {
  user: PropTypes.object.isRequired,
  centered: PropTypes.bool,
  extraContent: PropTypes.string
};

function Karma({ user }) {
  const userChain = _.chain(user);
  const comments = userChain.get('stats.karma.comments')
    .value() || 0;
  const posts = userChain.get('stats.karma.posts')
    .value() || 0;
  const recipes = userChain.get('stats.karma.recipes')
    .value() || 0;

  const total = comments + posts + recipes;

  return (
    <Grid celled="internally" textAlign="center">
      <Grid.Row centered columns={1}>
        <Grid.Column textAlign="center">
          <Header>{total} Karma</Header>
        </Grid.Column>
      </Grid.Row>

      <Grid.Row centered columns={3}>
        <Grid.Column textAlign="center">
          <Popup trigger={<CommentsKarma comments={comments} />} content="Comments Karma" />
        </Grid.Column>

        <Grid.Column textAlign="center">
          <Popup trigger={<PostsKarma posts={posts} />} content="Posts Karma" />
        </Grid.Column>

        <Grid.Column textAlign="center">
          <Popup trigger={<RecipesKarma recipes={recipes} />} content="Recipes Karma" />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

Karma.propTypes = {
  user: PropTypes.object.isRequired
};

function CommentsKarma({ comments, ...rest }) {
  return (
    <span {...rest}>
      <Icon name="comment outline" />
      {comments}
    </span>
  );
}

CommentsKarma.propTypes = {
  comments: PropTypes.string.isRequired
};

function PostsKarma({ posts, ...rest }) {
  return (
    <span {...rest}>
      <Icon name="wordpress forms" />
      {posts}
    </span>
  );
}

PostsKarma.propTypes = {
  posts: PropTypes.string.isRequired
};

function RecipesKarma({ recipes, ...rest }) {
  return (
    <span {...rest}>
      <Icon name="book" />
      {recipes}
    </span>
  );
}

RecipesKarma.propTypes = {
  recipes: PropTypes.string.isRequired
};
