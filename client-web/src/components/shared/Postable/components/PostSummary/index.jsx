import React from 'react';
import PropTypes from 'prop-types';
import { Button, Divider, Grid, Header } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import cx from 'clsx';

import useMedia, { mobile } from 'hooks/useMedia';
import { deletePost, lockPost, requeryPost, unlockPost } from 'services/posts';

import AuthenticatedWrapper from 'components/shared/AuthenticatedWrapper';
import Comments from 'components/shared/StatLabels/Comments';
import Favourite from 'components/shared/Buttons/Favourite';
import Favourites from 'components/shared/StatLabels/Favourites';
import PostContext from 'components/shared/Buttons/PostContext';
import Reactions from 'components/shared/Reactions';
import Report from 'components/shared/Buttons/Report';
import Section from 'components/shared/Section';
import SubTitle from 'components/shared/SubTitle';
import TimeAgo, { updatedAgo } from 'components/shared/TimeAgo';
import UserInfo from 'components/shared/UserInfo';
import Voteable from 'components/shared/Voteable';

import AdminControls from '../AdminControls';
import ForumTags from '../ForumTags';

import './style.styl';

export default function PostSummary({ post, canAdmin, canEdit, showContext }) {
  return (
    <div className="post-summary-component" data-cy="post" data-cy-post-id={post.id}>
      <Grid columns={2} divided>
        <Grid.Column only="computer tablet" width={1}>
          <Voteable voteable={post} voteableType="posts" onVoted={onVoted} />
        </Grid.Column>

        <Grid.Column stretched computer={15} tablet={15} mobile={16}>
          <PostDetail
            post={post}
            canAdmin={canAdmin}
            canEdit={canEdit}
            onVoted={onVoted}
            showContext={showContext}
          />
        </Grid.Column>
      </Grid>
    </div>
  );

  // private handlers

  function onVoted() {
    return requeryPost(post);
  }
}

PostSummary.defaultProps = {
  canAdmin: false,
  canEdit: false,
  showContext: false
};

PostSummary.propTypes = {
  post: PropTypes.object.isRequired,
  canAdmin: PropTypes.bool,
  canEdit: PropTypes.bool,
  showContext: PropTypes.bool
};

// private components

function PostDetail({ post, canAdmin, canEdit, onVoted, showContext }) {
  const isMobile = useMedia(mobile);

  return (
    <div className="post-detail">
      {isMobile && (
        <Grid columns={2}>
          <Grid.Row divided verticalAlign="middle">
            <Grid.Column width={2}>
              <Voteable voteable={post} voteableType="posts" onVoted={onVoted} />
            </Grid.Column>

            <Grid.Column width={14}>
              <Title post={post} />
              <PostInfo post={post} />
              <ForumTags post={post} />
              <Reactions
                className="post-list-reactions"
                reactions={post.reactions}
                reactionableId={post.id}
                reactionableType='posts'
                onReaction={onVoted}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      )}

      {!(isMobile) && (
        <>
          <Title post={post} />
          <PostInfo post={post} isMobile={isMobile} />
          <ForumTags post={post} />
          <Reactions
            className="post-list-reactions"
            reactions={post.reactions}
            reactionableId={post.id}
            reactionableType='posts'
            onReaction={onVoted}
          />
        </>
      )}

      <Divider />

      <Footer
        post={post}
        isMobile={isMobile}
        canAdmin={canAdmin}
        canEdit={canEdit}
        showContext={showContext}
      />
    </div>
  );
}

PostDetail.defaultProps = {
  canAdmin: false,
  canEdit: false,
  showContext: false
};

PostDetail.propTypes = {
  post: PropTypes.object.isRequired,
  canAdmin: PropTypes.bool,
  canEdit: PropTypes.bool,
  showContext: PropTypes.bool,
  onVoted: PropTypes.func.isRequired
};

function PostInfo({ post }) {
  return (
    <SubTitle>
      <div className="post-info">
        Post by &nbsp;
        <UserInfo user={post.user} /> &nbsp;
        <TimeAgo date={post.createdAt} /> &nbsp;
        <TimeAgo
          date={post.lastEdited}
          render={updatedAgo}
        />

        {(post?.stats?.comments?.comments > 0) && (
          <TimeAgo
            date={post.commentedAt}
            render={commentedAgo}
          />
        )}
      </div>
    </SubTitle>
  );
}

PostInfo.propTypes = {
  post: PropTypes.object.isRequired
};

function Title({ post }) {
  return <CommentsLink post={post}><Header sub className="title">{post.title}</Header></CommentsLink>;
}

Title.propTypes = {
  post: PropTypes.object.isRequired
};

function Footer({ post, canAdmin, canEdit, isMobile, showContext }) {
  const classNames = cx('footer', { 'is-mobile': isMobile });

  return (
    <Section className={classNames}>
      <Grid>
        <Grid.Row>
          <Stats post={post} />
          <Actions post={post} canAdmin={canAdmin} canEdit={canEdit} showContext={showContext} />
        </Grid.Row>
      </Grid>
    </Section>
  );
}

Footer.defaultProps = {
  canAdmin: false,
  canEdit: false,
  showContext: false,
  isMobile: false
};

Footer.propTypes = {
  post: PropTypes.object.isRequired,
  canAdmin: PropTypes.bool,
  canEdit: PropTypes.bool,
  showContext: PropTypes.bool,
  isMobile: PropTypes.bool
};

function Stats({ post }) {
  return (
    <Grid.Column width={8} className="stats">
      <Comments statable={post} />
      <Favourites statable={post} />
    </Grid.Column>
  );
}

Stats.propTypes = {
  post: PropTypes.object.isRequired
};

function Actions({ post, canAdmin, canEdit, showContext }) {
  return (
    <Grid.Column width={8} textAlign="right" className="actions">
      {showContext && (
        <PostContext post={post} />
      )}

      <AuthenticatedWrapper>
        <Favourite
          favouriteable={post}
          favouriteableType="posts"
          onFavourited={reloadPost}
        />
      </AuthenticatedWrapper>

      <Report
        reportable={post}
        reportableType="posts"
        onReported={reloadPost}
      />

      {(canEdit || canAdmin) && (
        <Button
          as={Link}
          to={`/posts/${post.id}/edit`}
          size="mini"
          data-cy="edit-post"
        >
          Edit
        </Button>
      )}

      {canAdmin && (
        <AdminControls
          locked={post.locked}
          onDelete={deleteThePost}
          onLock={lockThePost}
          onUnlock={unlockPost}
        />
      )}
    </Grid.Column>
  );

  // helper function

  function deleteThePost() {
    return deletePost(post);
  }

  function lockThePost() {
    return lockPost(post);
  }

  function reloadPost() {
    return requeryPost(post);
  }
}

Actions.defaultProps = {
  canAdmin: false,
  showContext: false,
  canEdit: false
};

Actions.propTypes = {
  post: PropTypes.object.isRequired,
  canAdmin: PropTypes.bool,
  showContext: PropTypes.bool,
  canEdit: PropTypes.bool
};

function CommentsLink({ post, children }) {
  return (
    <Link
      to={`/posts/${post.id}`}
    >
      {children}
    </Link>
  );
}

CommentsLink.propTypes = {
  post: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired
};

function commentedAgo(date) {
  return (
    <span>  last commented {date} ago</span>
  );
}
