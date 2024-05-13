import React from 'react';
import PropTypes from 'prop-types';
import { Button, Header, Divider, Grid, Segment } from 'semantic-ui-react';
import { Link, useRouteMatch } from 'react-router-dom';
import cx from 'clsx';

import useMedia, { mobile } from 'hooks/useMedia';

import AuthenticatedWrapper from 'components/shared/AuthenticatedWrapper';
import Comments from 'components/shared/StatLabels/Comments';
import Favourite from 'components/shared/Buttons/Favourite';
import Favourites from 'components/shared/StatLabels/Favourites';
import OwnerWrapper from 'components/shared/OwnerWrapper';
import Reactions from 'components/shared/Reactions';
import Report from 'components/shared/Buttons/Report';
import RichEditor from 'components/shared/RichEditor';
import Section from 'components/shared/Section';
import SubTitle from 'components/shared/SubTitle';
import TimeAgo, { updatedAgo } from 'components/shared/TimeAgo';
import UserInfo from 'components/shared/UserInfo';
import Voteable from 'components/shared/Voteable';
import { PostAdminControls, PostForumTags } from 'components/shared/Postable';

import './style.styl';


export default function PostDetail({ post, canModerate, onReload, onDelete, onLock, onUnlock }) {
  const isMobile = useMedia(mobile);

  return (post && (
    <Segment className="post-detail" data-cy="post-detail">
      {isMobile && (
        <Grid columns={2} divided>
          <Grid.Row>
            <Grid.Column width={2}>
              <Voteable voteable={post} voteableType="posts" onVoted={onReload} />
            </Grid.Column>

            <Grid.Column verticalAlign="middle" width={14}>
              <PostInfo post={post} />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column width={16}>
              <Title post={post} />
              <Content post={post} />

              <PostForumTags post={post} />

              <Reactions
                className="post-view-reactions"
                reactions={post.reactions}
                reactionableId={post.id}
                reactionableType='posts'
                onReaction={onReload}
              />

              <Divider />

              <Footer
                isMobile
                post={post}
                canModerate={canModerate}
                onDelete={onDelete}
                onLock={onLock}
                onUnlock={onUnlock}
                onReload={onReload}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      )}

      {!(isMobile) && (
        <Grid columns={2} divided>
          <Grid.Column only="computer tablet" width={1}>
            <Voteable voteable={post} voteableType="posts" onVoted={onReload} />
          </Grid.Column>

          <Grid.Column computer={15} tablet={15} mobile={16}>
            <Title post={post} />

            <PostInfo post={post} />

            <Content post={post} />

            <PostForumTags post={post} />

            <Reactions
              className="post-view-reactions"
              reactions={post.reactions}
              reactionableId={post.id}
              reactionableType='posts'
              onReaction={onReload}
            />

            <Divider />

            <Footer
              post={post}
              canModerate={canModerate}
              onDelete={onDelete}
              onLock={onLock}
              onUnlock={onUnlock}
              onReload={onReload}
            />
          </Grid.Column>
        </Grid>
      )}
    </Segment>
  )) || null;
}

PostDetail.defaultProps = {
  canModerate: false
};

PostDetail.propTypes = {
  post: PropTypes.object.isRequired,
  canModerate: PropTypes.bool,
  onReload: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onLock: PropTypes.func.isRequired,
  onUnlock: PropTypes.func.isRequired
};

function Title({ post }) {
  return <Header sub className="title" data-cy="post-title">{post.title}</Header>;
}

Title.propTypes = {
  post: PropTypes.object.isRequired
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
      </div>
    </SubTitle>
  );
}

PostInfo.propTypes = {
  post: PropTypes.object.isRequired
};

function Content({ post }) {
  return (
    <Section className="content" data-cy="post-content">
      <RichEditor
        readOnly
        id={`post-${post.id}`}
        message={post.content}
      />
    </Section>
  );
}

Content.propTypes = {
  post: PropTypes.object.isRequired
};

function Footer({ isMobile, post, canModerate, onDelete, onLock, onUnlock, onReload }) {
  const classnames = cx('footer', { 'is-mobile': isMobile });

  return (
    <Section className={classnames}>
      <Grid>
        <Grid.Row>
          <Stats post={post} />

          <Actions
            post={post}
            canModerate={canModerate}
            onDelete={onDelete}
            onLock={onLock}
            onUnlock={onUnlock}
            onReload={onReload}
          />
        </Grid.Row>
      </Grid>
    </Section>
  );
}

Footer.defaultProps = {
  isMobile: false,
  canModerate: false
};

Footer.propTypes = {
  post: PropTypes.object.isRequired,
  isMobile: PropTypes.bool,
  canModerate: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
  onLock: PropTypes.func.isRequired,
  onUnlock: PropTypes.func.isRequired,
  onReload: PropTypes.func.isRequired
};

function Stats({ post }) {
  return (
    <Grid.Column width={8}>
      <Comments statable={post} />
      <Favourites statable={post} />
    </Grid.Column>
  );
}

Stats.propTypes = {
  post: PropTypes.object.isRequired
};

function Actions({ post, canModerate, onLock, onUnlock, onDelete, onReload }) {
  const { url } = useRouteMatch();

  return (
    <Grid.Column className="post-detail-actions" width={8} textAlign="right">
      <AuthenticatedWrapper>
        <Favourite
          favouriteable={post}
          favouriteableType="posts"
          onFavourited={onReload}
        />
      </AuthenticatedWrapper>

      <OwnerWrapper object={post}>
        <Button size="mini" as={Link} to={`${url}/edit`}  data-cy="button-edit-post">Edit</Button>
      </OwnerWrapper>

      <Report
        reportable={post}
        reportableType="posts"
        onReported={onReload}
      />

      {canModerate && (
        <PostAdminControls
          locked={post?.locked}
          onDelete={onDelete}
          onLock={onLock}
          onUnlock={onUnlock}
        />
      )}
    </Grid.Column>
  );
}

Actions.defaultProps = {
  canModerate: false
};

Actions.propTypes = {
  post: PropTypes.object.isRequired,
  canModerate: PropTypes.bool,
  onLock: PropTypes.func.isRequired,
  onUnlock: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onReload: PropTypes.func.isRequired
};
