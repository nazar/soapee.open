import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table, Header } from 'semantic-ui-react';

import { differsInSeconds } from 'services/time';
import { metaForums } from 'services/forum';

import Comments from 'components/shared/StatLabels/Comments';
import Posts from 'components/shared/StatLabels/Posts';
import TimeAgo from 'components/shared/TimeAgo';

import './style.styl';


export default function ForumSummaryRow({ forum }) {
  const isMeta = metaForums[forum?.name];
  const nameColSpane = isMeta ? 3 : 1;

  return (
    <Table.Row className="forum-summary-row-component"  data-cy="forum-summary-row">
      <Table.Cell className="name" colSpan={nameColSpane}>
        <ForumNameAndSummary forum={forum} />
      </Table.Cell>

      {!(isMeta) && (
        <Table.Cell collapsing className="posts" verticalAlign="top" data-cy="last-post">
          {forumLastPostAndRecentPostDiffers(forum) && <LastActivePost forum={forum} />}
        </Table.Cell>
      )}

      {!(isMeta) && (
        <Table.Cell collapsing className="posts" verticalAlign="top" data-cy="most-recent-post">
          <LatestPost forum={forum} />
        </Table.Cell>
      )}

      {!(isMeta) && (
        <Table.Cell collapsing className="stats" data-cy="forum-stats">
          <ForumStats forum={forum} />
        </Table.Cell>
      )}
    </Table.Row>
  );
}

ForumSummaryRow.propTypes = {
  forum: PropTypes.object.isRequired
};


function ForumNameAndSummary({ forum }) {
  return (
    <Header size="tiny">
      <Link to={`/forums/${forum.id}`} data-cy="forum-name">{forum.name}</Link>
      <Header.Subheader data-cy="forum-summary">
        {forum.summary}
      </Header.Subheader>
    </Header>
  );
}

ForumNameAndSummary.propTypes = {
  forum: PropTypes.object.isRequired
};

function LatestPost({ forum }) {
  const [post] = forum.posts || [];

  return (post && (
    <Header size="tiny">
      Most recent post:
      <LastPostDetails post={post} />
    </Header>
  )) || null;
}

function LastActivePost({ forum }) {
  const [post] = forum.activePosts || [];

  return (post && (
    <Header size="tiny">
      Recent active post:
      <LastPostDetails post={post} />
    </Header>
  )) || null;
}

function LastPostDetails({ post }) {
  return (
    <Header.Subheader className="last_post_details">
      <Link to={`/posts/${post.id}`}>
        {post.title}
      </Link>

      <div className="small">
        Created {' '}
        <TimeAgo date={post.createdAt} />
      </div>

      {differsInSeconds(post.createdAt, post.commentedAt) && (
        <div className="small">
          Commented {' '}
          <TimeAgo date={post.commentedAt} />
        </div>
      )}
    </Header.Subheader>
  );
}

LastPostDetails.propTypes = {
  post: PropTypes.object.isRequired
};

function ForumStats({ forum }) {
  const posts = Number(_.get(forum, 'stats.posts.posts') || '0');
  const comments = Number(_.get(forum, 'stats.comments.comments') || '0');

  return ((posts > 0 || comments > 0) && (
    <div className="stat-container">
      {posts > 0 && (
        <div className="stat">
          <Posts
            showTooltip
            statable={forum}
            tooltip="Total number of Forum Posts"
          />
        </div>
      )}

      {comments > 0 && (
        <div className="stat">
          <Comments
            showTooltip
            statable={forum}
            tooltip="Total number of Forum Comments"
          />
        </div>
      )}
    </div>
  )) || null;
}

function forumLastPostAndRecentPostDiffers(forum) {
  const [lastPost] = forum.posts || [];
  const [lastActive] = forum.activePosts || [];

  return lastPost?.id !== lastActive?.id;
}
