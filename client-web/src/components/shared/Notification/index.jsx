import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import { Feed, Icon } from 'semantic-ui-react';
import { Emoji } from 'emoji-mart';
import { Link } from 'react-router-dom';

import client from 'client';
import TimeAgo from 'components/shared/TimeAgo';

import approveFriendFromNotificationMutation from './queries/approveFriendFromNotification.gql';

export default function Notification({ notification }) {
  const notificationType = notification.notificationMeta.type;

  const RendererSummary = summaryRenderers[notificationType];
  const RendererDetails = detailRenderers[notificationType];

  return (
    <Feed.Event className="notification-component" data-cy="notification-item">
      <Feed.Label>
        <img src={notification.sourceUser.canonicalImage} alt="" />
      </Feed.Label>

      <Feed.Content>
        <NotificationSummary notification={notification}>
          <RendererSummary notification={notification} />
        </NotificationSummary>

        <RendererDetails notification={notification} />
      </Feed.Content>
    </Feed.Event>
  );
}

Notification.propTypes = {
  notification: PropTypes.object.isRequired
};

function NotificationSummary({ notification, children }) {
  return (
    <Feed.Summary>
      <Feed.User as={Link} to={`/profiles/${notification.sourceUser.id}`} data-cy="notification-user">
        {notification.sourceUser.name}
      </Feed.User>

      <span data-cy="summary">{children}</span>

      <Feed.Date>
        <TimeAgo plain date={notification.createdAt} />
      </Feed.Date>
    </Feed.Summary>
  );
}

NotificationSummary.propTypes = {
  notification: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired
};

function BestRecipeNotificationSummary({ notification }) {
  const recipeId = notification.notifiableId;

  return (
    <span data-cy="notification-best-recipe">
      {' '}promoted your{' '}
      <Link to={`/recipes/${recipeId}`}>recipe</Link>
      {' '}to Best 🏆
    </span>
  );
}

BestRecipeNotificationSummary.propTypes = {
  notification: PropTypes.object.isRequired
};

function CommentNotificationSummary({ notification }) {
  const { notificationMeta: { commentTarget } } = notification;
  const target = _.upperFirst(pluralize.singular(commentTarget.targetType));

  return (
    <span>
      {' '}commented on your{' '}
      <Link to={`/${commentTarget.targetType}/${commentTarget.targetId}`} data-cy-target={commentTarget.targetType}>
        {target}
      </Link>
    </span>
  );
}

CommentNotificationSummary.propTypes = {
  notification: PropTypes.object.isRequired
};

function CopiedRecipeSummary({ notification }) {
  const sourceRecipeId = notification.notificationMeta.fromRecipeId;
  const copiedRecipeId = notification.notifiableId;

  return (
    <span data-cy="notification-copied-recipe">
      {' '}has <Link to={`/recipes/${copiedRecipeId}`}>copied</Link>
      {' '}your <Link to={`/recipes/${sourceRecipeId}`}>recipe</Link>
    </span>
  );
}

CopiedRecipeSummary.propTypes = {
  notification: PropTypes.object.isRequired
};

function FavouriteNotificationSummary({ notification }) {
  const { notificationMeta: { favouriteTarget } } = notification;

  const target = _.upperFirst(pluralize.singular(favouriteTarget.targetType));

  if (favouriteTarget.parentAction === 'comment') {
    return (
      <span>
        {' '}favourited your comment on {' '}
        <Link to={`/${favouriteTarget.targetType}/${favouriteTarget.targetId}`} data-cy-parent={favouriteTarget.parentAction}>
          {target}
        </Link>
      </span>
    );
  } else {
    return (
      <span>
        {' '}favourited your{' '}
        <Link to={`/${favouriteTarget.targetType}/${favouriteTarget.targetId}`} data-cy-target={favouriteTarget.targetType}>
          {target}
        </Link>

      </span>
    );
  }
}

FavouriteNotificationSummary.propTypes = {
  notification: PropTypes.object.isRequired
};

function ForumSubscribedNotificationSummary({ notification }) {
  const forumName = notification.notificationMeta.name;
  const forumId = notification.notifiableId;

  return (
    <span data-cy="notification-subscribed-forum">
      {' '}has subscribed to your Forum
      {' '}<Link to={`/forums/${forumId}`}>{forumName}</Link>
    </span>
  );
}

ForumSubscribedNotificationSummary.propTypes = {
  notification: PropTypes.object.isRequired
};

function CommentNotificationDetail({ notification }) {
  const commentText = notification.notificationMeta.commentExcerpt;

  return (
    <Feed.Extra text data-cy="comment-text">
      {commentText}
    </Feed.Extra>
  );
}

CommentNotificationDetail.propTypes = {
  notification: PropTypes.object.isRequired
};

function FriendRequestSummary() {
  return (
    <span data-cy-target="friendRequest">
      {' '}sent a Friend Request
    </span>
  );
}

function FriendRequestDetail({ notification: { id, notificationMeta } }) {
  return (
    <>
      <Feed.Extra text>
        Friends will be able to see your &quot;visible to friends&quot; recipes
      </Feed.Extra>

      <Feed.Meta>
        {_.isEmpty(notificationMeta.friendship) && (
          <Feed.Like data-cy="notification-approve-friend-request" onClick={handleApproveFriendRequest}>
            <Icon name="check" color="green" /> Approve Friend Request
          </Feed.Like>
        )}

        {!(_.isEmpty(notificationMeta.friendship)) && (
          <Feed.Like data-cy="notification-approved-friend-request">
            Approved Friend Request!
          </Feed.Like>
        )}
      </Feed.Meta>
    </>
  );

  function handleApproveFriendRequest() {
    return client
      .mutate({
        mutation: approveFriendFromNotificationMutation,
        variables: {
          notificationId: id
        }
      });
  }
}

FriendRequestDetail.propTypes = {
  notification: PropTypes.object.isRequired
};

function FriendRequestApprovedSummary() {
  return (
    <span data-cy-target="friendRequestApproved">
      {' '}approved your Friend Request
    </span>
  );
}

function MyForumNotificationSummary() {
  return (
    <span data-cy-target="myForumPost">
      {' '}posted in your Forum
    </span>
  );
}

function MyForumNotificationDetail({ notification }) {
  const { notificationMeta: { forum, title } } = notification;

  return (
    <Feed.Extra text data-cy="subbed-post-text">
      Post <Link to={`/posts/${notification.notifiableId}`}>{title}</Link>
      {' '}in Forum {' '}
      <Link to={`/forums/${forum.id}`}>{forum.name}</Link>
    </Feed.Extra>
  );
}

MyForumNotificationDetail.propTypes = {
  notification: PropTypes.object.isRequired
};

function PostParticipantSummary() {
  return (
    <span data-cy-target="postParticipant">
      {' '}commented in a participated Post
    </span>
  );
}

function ReactionSummary({ notification }) {
  const { notificationMeta: { reactionTarget, reaction } } = notification;

  const target = _.upperFirst(pluralize.singular(reactionTarget.targetType));

  if (reactionTarget.parentAction === 'comment') {
    return (
      <span>
        {' '}reacted with{' '}
        <Emoji
          tooltip
          emoji={reaction}
          size={16}
        />
        {' '}on your comment on {' '}
        <Link to={`/${reactionTarget.targetType}/${reactionTarget.targetId}`} data-cy-parent={reactionTarget.parentAction}>
          {target}
        </Link>
      </span>
    );
  } else {
    return (
      <span>
        {' '}reacted with{' '}
        <Emoji
          tooltip
          emoji={reaction}
          size={16}
        />
        {' '}on your{' '}
        <Link to={`/${reactionTarget.targetType}/${reactionTarget.targetId}`} data-cy-target={reactionTarget.targetType}>
          {target}
        </Link>
      </span>
    );
  }
}

function PostParticipantDetail({ notification }) {
  const { notificationMeta: { title, commentExcerpt, postTarget, commentTarget } } = notification;
  const target = _.upperFirst(pluralize.singular(postTarget.targetType));

  return (
    <Feed.Extra text data-cy="participated-comment-text">
      Post <Link to={`/posts/${commentTarget.targetId}`}>{title}</Link>
      {' '} in <Link to={`/${postTarget.targetType}/${postTarget.targetId}`}>{target}</Link>
      <p>{commentExcerpt}</p>
    </Feed.Extra>
  );
}

PostParticipantDetail.propTypes = {
  notification: PropTypes.object.isRequired
};

function SubscribedForumNotificationSummary() {
  return (
    <span data-cy-target="subscribedForumPost">
      {' '}posted in your subscribed Forum
    </span>
  );
}

function SubscribedForumNotificationDetail({ notification }) {
  const { notificationMeta: { forum, title } } = notification;

  return (
    <Feed.Extra text data-cy="subbed-post-text">
      Post <Link to={`/posts/${notification.notifiableId}`}>{title}</Link>
      {' '} in Forum {' '}
      <Link to={`/forums/${forum.id}`}>{forum.name}</Link>
    </Feed.Extra>
  );
}

SubscribedForumNotificationDetail.propTypes = {
  notification: PropTypes.object.isRequired
};

function VoteNotificationSummary({ notification }) {
  const { notificationMeta: { voteTarget } } = notification;

  const target = _.upperFirst(pluralize.singular(voteTarget.targetType));

  if (voteTarget.parentAction === 'comment') {
    return (
      <span>
        {' '}upvoted your comment on {' '}
        <Link to={`/${voteTarget.targetType}/${voteTarget.targetId}`} data-cy-parent={voteTarget.parentAction}>
          {target}
        </Link>
      </span>
    );
  } else {
    return (
      <span>
        {' '}upvoted your{' '}
        <Link to={`/${voteTarget.targetType}/${voteTarget.targetId}`} data-cy-target={voteTarget.targetType}>
          {target}
        </Link>

      </span>
    );
  }
}

VoteNotificationSummary.propTypes = {
  notification: PropTypes.object.isRequired
};

function NullComponent() {
  return null;
}

const detailRenderers = {
  bestRecipe: NullComponent,
  comment: CommentNotificationDetail,
  copiedRecipe: NullComponent,
  favourite: NullComponent,
  forumSubscribed: NullComponent,
  friendRequest: FriendRequestDetail,
  friendRequestApproved: NullComponent,
  myForumPost: MyForumNotificationDetail,
  postParticipant: PostParticipantDetail,
  reaction: NullComponent,
  subscribedForumPost: SubscribedForumNotificationDetail,
  upvote: NullComponent
};

const summaryRenderers = {
  bestRecipe: BestRecipeNotificationSummary,
  comment: CommentNotificationSummary,
  copiedRecipe: CopiedRecipeSummary,
  favourite: FavouriteNotificationSummary,
  forumSubscribed: ForumSubscribedNotificationSummary,
  friendRequest: FriendRequestSummary,
  friendRequestApproved: FriendRequestApprovedSummary,
  myForumPost: MyForumNotificationSummary,
  postParticipant: PostParticipantSummary,
  reaction: ReactionSummary,
  subscribedForumPost: SubscribedForumNotificationSummary,
  upvote: VoteNotificationSummary
};
