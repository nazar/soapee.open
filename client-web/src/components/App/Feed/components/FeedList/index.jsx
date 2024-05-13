import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Message, Segment } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import usePaginator from 'hooks/usePaginator';

import UberPaginator from 'components/shared/UberPaginator';
import Section from 'components/shared/Section';
import UserInfo from 'components/shared/UserInfo';
import TimeAgo from 'components/shared/TimeAgo';

import './style.styl';


export default function FeedList({ itemsQuery, summaryQuery }) {
  const { paginatorProps, items: feed, loading } = usePaginator({
    summaryQuery,
    itemsQuery,
    perPage: 20
  });

  return (
    <div className="feed-list-component" data-cy="feed-list-component">
      <Section basic loading={loading} padded={false}>
        {_.map(feed, feedItem => (
          <Segment key={`feed-${feedItem.id}`}>
            <FeedItemRenderer feedItem={feedItem} />
          </Segment>
        ))}
      </Section>

      {_.isEmpty(feed) && !loading && <NotFoundMessage />}

      <UberPaginator {...paginatorProps} />
    </div>
  );
}

FeedList.propTypes = {
  itemsQuery: PropTypes.object.isRequired,
  summaryQuery: PropTypes.object.isRequired
};

function FeedItemRenderer({ feedItem }) {
  const FeedItemComponent = FeedDetailComponents[feedItem.feedMeta.type];

  return <FeedItemComponent feedItem={feedItem} key={`feed-item-${feedItem.id}`} />;
}

FeedItemRenderer.propTypes = {
  feedItem: PropTypes.object.isRequired
};

function NewUserFeedItem({ feedItem: { user, createdAt } }) {
  return (
    <div className="feed-item new-user" data-cy="feed-item-new-user">
      <div className="feed-details">
        <UserInfo user={user} />{' '} joined <TimeAgo date={createdAt} />.
      </div>
    </div>
  );
}

NewUserFeedItem.propTypes = {
  feedItem: PropTypes.object.isRequired
};

function NewPostItem({
  feedItem: {
    user,
    createdAt,
    feedMeta: {
      post: {
        id: postId,
        title,
        postableId,
        postableType
      },
      postable: {
        name
      }
    }
  }
}) {
  const postableTarget = {
    forums: 'Forum',
    oils: 'Oil'
  }[postableType];

  const postableTargetLink = {
    forums: `/forums/${postableId}`,
    oils: `/oils/${postableId}`
  }[postableType];

  return (
    <div className="feed-item post" data-cy="feed-item-new-post">
      <div className="feed-details" data-cy="feed-details">
        <UserInfo user={user} />{' '}
        created a new Post <Link to={`/posts/${postId}`}>{title}</Link>{' '}
        in {postableTarget} <Link to={postableTargetLink}>{name}</Link>{' '}
        <TimeAgo date={createdAt} />
      </div>
    </div>
  );
}

NewPostItem.propTypes = {
  feedItem: PropTypes.object.isRequired
};

function NewPublicRecipeItem({
  feedItem: {
    user,
    createdAt,
    feedMeta: {
      recipe: {
        id: recipeId,
        name
      }
    }
  }
}) {
  return (
    <div className="feed-item new-public-recipe" data-cy="feed-item-new-public-recipe">
      <div className="feed-details">
        <UserInfo user={user} />{' '}
        created public Recipe <Link to={`/recipes/${recipeId}`}>{name}</Link>{' '}
        <TimeAgo date={createdAt} />.
      </div>
    </div>
  );
}

NewPublicRecipeItem.propTypes = {
  feedItem: PropTypes.object.isRequired
};

function NewRecipeJournalItem({
  feedItem: {
    user,
    createdAt,
    feedMeta: {
      recipe: {
        id: recipeId,
        name
      }
    }
  }
}) {
  return (
    <div className="feed-item new-recipe-journal" data-cy="feed-item-new-recipe-journal">
      <div className="feed-details" data-cy="feed-details">
        <UserInfo user={user} />{' '}
        added a new Journal on Recipe <Link to={`/recipes/${recipeId}`}>{name}</Link>{' '}
        <TimeAgo date={createdAt} />.
      </div>
    </div>
  );
}

NewRecipeJournalItem.propTypes = {
  feedItem: PropTypes.object.isRequired
};

function NewCommentItem({
  feedItem: {
    user,
    createdAt,
    feedMeta: {
      comment: { commentableType },
      commentable: {
        id,
        name,
        title
      }
    }
  }
}) {
  const commentableTarget = {
    posts: 'Post',
    recipes: 'Recipe'
  }[commentableType];

  const commentableTargetLink = {
    posts: `/posts/${id}`,
    recipes: `/recipes/${id}`
  }[commentableType];

  return (
    <div className="feed-item new-comment" data-cy="feed-item-new-comment">
      <div className="feed-details" data-cy="feed-details">
        <UserInfo user={user} />{' '}
        commented on {commentableTarget} <Link to={commentableTargetLink}>{name || title}</Link>{' '}
        <TimeAgo date={createdAt} />.
      </div>
    </div>
  );
}

NewCommentItem.propTypes = {
  feedItem: PropTypes.object.isRequired
};

function NotFoundMessage() {
  return (
    <Message icon>
      <Message.Content>
        <Message.Header>No Feed yet</Message.Header>
        Feed should start populating shortly...
      </Message.Content>
    </Message>
  );
}

const FeedDetailComponents = {
  newComment: NewCommentItem,
  newPost: NewPostItem,
  newPublicRecipe: NewPublicRecipeItem,
  newRecipeJournal: NewRecipeJournalItem,
  newUser: NewUserFeedItem
};
