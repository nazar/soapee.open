import _ from 'lodash';
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Button, Container, Grid, Message } from 'semantic-ui-react';
import { Link, useParams } from 'react-router-dom';
import { useCreation } from 'ahooks';
import { useQuery } from '@apollo/client';
import cx from 'clsx';

import useCurrentUser from 'hooks/useCurrentUser';
import useMedia, { mobile } from 'hooks/useMedia';
import { metaForums } from 'services/forum';

import ErrorMessage from 'components/shared/ErrorMessage';
import { PostsRef } from 'components/shared/Postable';
import Section from 'components/shared/Section';
import Subscribe from 'components/shared/Buttons/Subscribe';
import StatsPosts from 'components/shared/StatLabels/Posts';

import Breadcrumb from '../components/BreadCrumb';
import StatSubscribers from '../components/StatSubscribers';
import { userCanPost, userIsForumAdmin } from '../utils/moderation';

import CreateForumPost from './components/CreateForumPost';


import forumQuery from './queries/forum.gql';

import './style.styl';

export default function View() {
  const { forumId } = useParams();

  const { loading, data: { forum } = {}, errors, refetch } = useQuery(forumQuery, {
    variables: { id: forumId }
  });

  const forumName = _.get(forum, 'name', '');
  const forumIsLocked = _.chain(forum).get('locks').isEmpty().thru(empty => !(empty)).value();
  const isMetaForum = metaForums[forum?.name];

  const currentUser = useCurrentUser();
  const forumIdForPosts = isMetaForum ? forum?.name : forum?.id;
  const postsRef = useRef();

  const canPost = useCreation(
    () => currentUser && userCanPost(currentUser, forum) && !(forumIsLocked) && !(isMetaForum),
    [currentUser, forum, forumIsLocked, isMetaForum]
  );

  const canAdmin = useCreation(
    () => userIsForumAdmin(currentUser, forum) || currentUser?.isAdmin,
    [currentUser, forum]
  );

  if (_.isEmpty(errors)) {
    return (
      <Container className="view-forum view-page">
        <Helmet>
          <title>{forumName} - Soapee</title>
          <meta name="description" content={forum?.bannerStr} />
        </Helmet>

        <Bread forumName={forumName} />

        <Section loading={loading}>
          {!(loading) && (
            <>
              <ForumDetails forum={forum} isMetaForum={isMetaForum} onSubscribed={handleReloadPost} />

              <PostsRef
                postableId={forumIdForPosts}
                postableType="forums"
                entityName="Posts"
                initialSortOrder={forumPostsDefaultSortOption}
                extraSortOptions={forumPostsExtraOptions}
                canPost={canPost}
                canAdmin={canAdmin}
                showContext={isMetaForum}
                ref={postsRef}
              />

              {forumIsLocked && (<ForumIsLockedMessage />)}

              {!(forumIsLocked) && canPost && <CreateForumPost forum={forum} onCreatedPost={handleCreatePost} />}
            </>
          )}
        </Section>
      </Container>
    );
  } else {
    return (
      <Container>
        <ErrorMessage message="Forum not found or error loading the forum." />
        <Message>
          <Link to="/forums">Back to</Link> Forums.
        </Message>
      </Container>
    );
  }

  //

  function handleReloadPost() {
    return refetch();
  }

  function handleCreatePost(post) {
    return refetch()
      .then(() => postsRef.current.addNewPost(post));
  }
}

function ForumDetails({ forum, isMetaForum, onSubscribed }) {
  const currentUser = useCurrentUser();
  const isMobile = useMedia(mobile);

  const canEdit = useCreation(() => userIsForumAdmin(currentUser, forum), [currentUser, forum]);

  const forumId = forum?.id;
  const name = forum?.name;
  const banner = forum?.banner;
  const columnWidth = isMetaForum ? 16 : 8;

  return (
    <div className={cx('forum-details', { 'is-mobile': isMobile })} data-cy="forum-details">
      <Message>
        <h1>#{name}</h1>
        <div dangerouslySetInnerHTML={{ __html: banner }} />

        <Section className="forum-footer">
          <Grid>
            <Grid.Row>
              {!(isMetaForum) && (
                <Grid.Column width={8} className="stats" data-cy="stats-posts">
                  <StatSubscribers
                    showTooltip
                    forum={forum}
                  />

                  <StatsPosts
                    showTooltip
                    statable={forum}
                  />
                </Grid.Column>
              )}

              <Grid.Column width={columnWidth} textAlign="right" className="actions">
                {!(_.isEmpty(currentUser)) && !(isMetaForum) && (
                  <Subscribe
                    forum={forum}
                    onSubscribed={onSubscribed}
                  />
                )}

                {canEdit && (
                  <Button size="mini" as={Link} to={`/forums/${forumId}/edit`}>Edit Forum</Button>
                )}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Section>
      </Message>
    </div>
  );
}

ForumDetails.defaultProps = {
  isMetaForum: false
};

ForumDetails.propTypes = {
  forum: PropTypes.object.isRequired,
  isMetaForum: PropTypes.bool,
  onSubscribed: PropTypes.func.isRequired
};

function ForumIsLockedMessage() {
  return (
    <Message
      negative
      icon="lock"
      header="Forum is locked"
      content="This Forum is locked. New posts cannot be added until this Forum is unlocked."
    />
  );
}

function Bread({ forumName }) {
  return (
    <Breadcrumb activeSection={`${forumName}`} data-cy="bread" />
  );
}

Bread.propTypes = {
  forumName: PropTypes.string.isRequired
};

const forumPostsDefaultSortOption = { field: 'latestActivity', direction: 'desc' };
const forumPostsExtraOptions = [{ value: forumPostsDefaultSortOption, text: 'Latest Activity', key: 7 }];
