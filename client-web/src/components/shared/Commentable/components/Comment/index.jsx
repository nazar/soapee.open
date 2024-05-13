import _ from 'lodash';
import Bluebird from 'bluebird';
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Grid, Button, Divider } from 'semantic-ui-react';
import cx from 'clsx';

import useMedia, { mobile } from 'hooks/useMedia';

import AuthenticatedWrapper from 'components/shared/AuthenticatedWrapper';
import CommentContext from 'components/shared/Buttons/CommentContext';
import Favourite from 'components/shared/Buttons/Favourite';
import Favourites from 'components/shared/StatLabels/Favourites';
import GAEventReporter from 'components/shared/GAEventReporter';
import OwnerWrapper from 'components/shared/OwnerWrapper';
import PostImageLinkMessage from 'components/shared/PostimageLinkMessage';
import Reactions from 'components/shared/Reactions';
import Report from 'components/shared/Buttons/Report';
import RichEditor from 'components/shared/RichEditor';
import Section from 'components/shared/Section';
import SubTitle from 'components/shared/SubTitle';
import TimeAgo, { updatedAgo } from 'components/shared/TimeAgo';
import UserInfo from 'components/shared/UserInfo';
import Voteable from 'components/shared/Voteable';

import useAuthenticated from 'hooks/useAuthenticated';

import AdminControls from '../AdminControls';
import './style.styl';


export default function Comment({
  comment,
  canModerate,
  canEdit,
  canReport,
  showContext,
  onDeleteComment,
  onUpdateComment,
  onReloadComment }
) {
  const authenticated = useAuthenticated();

  return (
    <div className="comment-component" data-cy="comment" data-cy-comment-id={comment.id}>
      <Grid divided columns={2}>
        <Grid.Column only="computer tablet" width={1} data-cy="voteable-column-not-mobile">
          <Voteable
            voteable={comment}
            voteableType="comments"
            onVoted={handleVoted}
          />
        </Grid.Column>

        <Grid.Column stretched computer={15} tablet={15} mobile={16}>
          <CommentDetail
            comment={comment}
            authenticated={authenticated}
            canModerate={canModerate}
            canEdit={canEdit}
            canReport={canReport}
            showContext={showContext}
            onDeleteComment={onDeleteComment}
            onUpdateComment={onUpdateComment}
            onReloadComment={onReloadComment}
          />
        </Grid.Column>
      </Grid>
    </div>
  );

  function handleVoted() {
    return onReloadComment(comment);
  }
}

Comment.defaultProps = {
  canModerate: false,
  canEdit: false,
  canReport: true,
  showContext: false
};

Comment.propTypes = {
  comment: PropTypes.object.isRequired,
  canModerate: PropTypes.bool,
  canEdit: PropTypes.bool,
  canReport: PropTypes.bool,
  showContext: PropTypes.bool,
  onDeleteComment: PropTypes.func.isRequired,
  onUpdateComment: PropTypes.func.isRequired,
  onReloadComment: PropTypes.func.isRequired
};

function CommentDetail({
  comment,
  authenticated,
  canModerate,
  canEdit,
  canReport,
  showContext,
  onDeleteComment,
  onUpdateComment,
  onReloadComment
}) {
  const [readOnly, setReadOnly] = useState(true);
  const reactions = _.get(comment, 'reactions');
  const showReactions = authenticated || !(_.isEmpty(reactions));
  const editor = useRef();
  const isMobile = useMedia(mobile);

  return (
    <div className="comment-detail">
      {isMobile
        ? <CommentInfoMobile comment={comment} onReloadComment={onReloadComment} />
        : <CommentInfo comment={comment} />
      }

      <Divider />

      <Content
        comment={comment}
        editor={editor}
        readOnly={readOnly}
      />

      {showReactions && (
        <>
          <Divider hidden />
          <Reactions
            reactionableId={comment.id}
            reactionableType="comments"
            reactions={reactions}
            onReaction={handleReacted}
          />
        </>
      )}

      <Divider />
      <Footer
        comment={comment}
        canModerate={canModerate}
        canEdit={canEdit}
        canReport={canReport}
        showContext={showContext}
        readOnly={readOnly}
        onReadOnlyChange={setReadOnly}
        onDeleteComment={onDeleteComment}
        onUpdateComment={handleUpdateComment}
        onReloadComment={onReloadComment}
      />
    </div>
  );

  function handleReacted() {
    return onReloadComment(comment);
  }

  function handleUpdateComment() {
    const newCommentContent = editor.current.getEditorMessage();

    return Bluebird
      .resolve(onUpdateComment(comment, newCommentContent))
      .then(() => setReadOnly(true));
  }
}

CommentDetail.defaultProps = {
  authenticated: false,
  canModerate: false,
  canEdit: true,
  canReport: true,
  showContext: false
};

CommentDetail.propTypes = {
  comment: PropTypes.object.isRequired,
  authenticated: PropTypes.bool,
  canModerate: PropTypes.bool,
  canEdit: PropTypes.bool,
  canReport: PropTypes.bool,
  showContext: PropTypes.bool,
  onDeleteComment: PropTypes.func.isRequired,
  onUpdateComment: PropTypes.func.isRequired,
  onReloadComment: PropTypes.func.isRequired
};

function CommentInfo({ comment }) {
  return (
    <SubTitle>
      Comment by <UserInfo user={comment.user} /> &nbsp;
      <TimeAgo date={comment.createdAt} />
      <TimeAgo
        date={comment.lastEdited}
        render={updatedAgo}
      />
    </SubTitle>
  );
}

CommentInfo.propTypes = {
  comment: PropTypes.object.isRequired
};

function CommentInfoMobile({ comment, onReloadComment }) {
  return (
    <Grid divided columns={2} verticalAlign="middle" data-cy="comment-info-mobile">
      <Grid.Column width={2}>
        <Voteable
          voteable={comment}
          voteableType="comments"
          onVoted={handleVoted}
        />
      </Grid.Column>

      <Grid.Column width={14}>
        <SubTitle>
          Comment by <UserInfo user={comment.user} /> &nbsp;
          <TimeAgo date={comment.createdAt} />
          <TimeAgo
            date={comment.lastEdited}
            render={updatedAgo}
          />
        </SubTitle>
      </Grid.Column>
    </Grid>
  );

  function handleVoted() {
    return onReloadComment(comment);
  }
}

CommentInfoMobile.propTypes = {
  comment: PropTypes.object.isRequired,
  onReloadComment: PropTypes.func.isRequired
};

function Content({ comment, editor, readOnly }) {
  return (
    <Section className="content">
      <PostImageLinkMessage visible={!(readOnly)} />
      <RichEditor id={`comment-${comment.id}`} message={comment.comment} ref={editor} readOnly={readOnly} />
    </Section>
  );
}

Content.defaultProps = {
  readOnly: true
};

Content.propTypes = {
  comment: PropTypes.object.isRequired,
  editor: PropTypes.object.isRequired,
  readOnly: PropTypes.bool
};

function Footer({
  comment,
  canModerate,
  canEdit,
  canReport,
  showContext,
  readOnly,
  onDeleteComment,
  onReadOnlyChange,
  onUpdateComment,
  onReloadComment
}) {
  const isMobile = useMedia(mobile);

  return (
    <div className="footer">
      <Grid>
        <Grid.Row>
          <Stats comment={comment} />

          <Actions
            comment={comment}
            canModerate={canModerate}
            readOnly={readOnly}
            canEdit={canEdit}
            canReport={canReport}
            showContext={showContext}
            isMobile={isMobile}
            onDeleteComment={onDeleteComment}
            onReadOnlyChange={onReadOnlyChange}
            onUpdateComment={onUpdateComment}
            onReloadComment={onReloadComment}
          />
        </Grid.Row>
      </Grid>
    </div>
  );
}

Footer.defaultProps = {
  canModerate: false,
  readOnly: true,
  canEdit: true,
  canReport: true,
  showContext: false
};

Footer.propTypes = {
  comment: PropTypes.object.isRequired,
  canModerate: PropTypes.bool,
  readOnly: PropTypes.bool,
  canEdit: PropTypes.bool,
  canReport: PropTypes.bool,
  showContext: PropTypes.bool,
  onDeleteComment: PropTypes.func.isRequired,
  onReadOnlyChange: PropTypes.func.isRequired,
  onUpdateComment: PropTypes.func.isRequired,
  onReloadComment: PropTypes.func.isRequired
};

function Stats({ comment }) {
  return (
    <Grid.Column width={8}>
      <Favourites statable={comment} />
    </Grid.Column>
  );
}

Stats.propTypes = {
  comment: PropTypes.object.isRequired
};

function Actions({
  comment,
  canModerate,
  readOnly,
  isMobile,
  canEdit,
  canReport,
  showContext,
  onDeleteComment,
  onReadOnlyChange,
  onUpdateComment,
  onReloadComment
}) {
  const classNames = cx('comment-actions', { 'is-mobile': isMobile });

  return (
    <Grid.Column width={8} textAlign="right" className={classNames}>
      {canEdit && (
        <OwnerWrapper object={comment}>
          <Edit
            readOnly={readOnly}
            onReadOnlyChange={onReadOnlyChange}
          />

          <Cancel
            readOnly={readOnly}
            onReadOnlyChange={onReadOnlyChange}
          />

          <Update
            readOnly={readOnly}
            onUpdateComment={onUpdateComment}
          />
        </OwnerWrapper>
      )}

      {showContext && (
        <CommentContext comment={comment} />
      )}

      <AuthenticatedWrapper>
        <Favourite
          favouriteable={comment}
          favouriteableType="comments"
          onFavourited={handleReload}
        />
      </AuthenticatedWrapper>

      {canReport && (
        <AuthenticatedWrapper>
          <Report
            reportable={comment}
            reportableType="comments"
            onReported={handleReload}
          />
        </AuthenticatedWrapper>
      )}

      {canModerate && (
        <AdminControls
          onDelete={handleDelete}
        />
      )}
    </Grid.Column>
  );

  function handleReload() {
    return onReloadComment(comment);
  }

  function handleDelete() {
    return onDeleteComment(comment);
  }
}

Actions.defaultProps = {
  canModerate: false,
  readOnly: true,
  isMobile: false,
  canEdit: true,
  canReport: true,
  showContext: false
};

Actions.propTypes = {
  comment: PropTypes.object.isRequired,
  canModerate: PropTypes.bool,
  readOnly: PropTypes.bool,
  isMobile: PropTypes.bool,
  canEdit: PropTypes.bool,
  canReport: PropTypes.bool,
  showContext: PropTypes.bool,
  onDeleteComment: PropTypes.func.isRequired,
  onReadOnlyChange: PropTypes.func.isRequired,
  onUpdateComment: PropTypes.func.isRequired,
  onReloadComment: PropTypes.func.isRequired
};

function Edit({ readOnly, onReadOnlyChange }) {
  return readOnly && (
    <GAEventReporter
      category="Comments"
      action="editComment"
    >
      <Button size="mini" onClick={handle} data-cy="edit-comment">
        Edit
      </Button>
    </GAEventReporter>
  );

  function handle() {
    onReadOnlyChange(false);
  }
}

Edit.defaultProps = {
  readOnly: true
};

Edit.propTypes = {
  readOnly: PropTypes.bool,
  onReadOnlyChange: PropTypes.func.isRequired
};

function Cancel({ readOnly, onReadOnlyChange }) {
  return !(readOnly) && (
    <GAEventReporter
      category="Comments"
      action="cancelEditComment"
    >
      <Button size="mini" onClick={handle} data-cy="cancel-edit-comment">
        Cancel
      </Button>
    </GAEventReporter>
  );

  function handle() {
    onReadOnlyChange(true);
  }
}

Cancel.defaultProps = {
  readOnly: true
};

Cancel.propTypes = {
  readOnly: PropTypes.bool,
  onReadOnlyChange: PropTypes.func.isRequired
};

function Update({ readOnly, onUpdateComment }) {
  const [updatingComment, setUpdatingComment] = useState(false);

  return !(readOnly) && (
    <GAEventReporter
      category="Comments"
      action="updateComment"
    >
      <Button
        primary
        size="mini"
        loading={updatingComment}
        onClick={handleCommentUpdate}
        data-cy="update-comment"
      >
        Update
      </Button>
    </GAEventReporter>
  );

  function handleCommentUpdate() {
    setUpdatingComment(true);

    return Bluebird
      .resolve(onUpdateComment())
      .finally(() => setUpdatingComment(false));
  }
}

Update.defaultProps = {
  readOnly: true
};

Update.propTypes = {
  readOnly: PropTypes.bool,
  onUpdateComment: PropTypes.func.isRequired
};
