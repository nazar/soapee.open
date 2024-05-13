import _ from 'lodash';
import Bluebird from 'bluebird';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Message, Segment, Transition } from 'semantic-ui-react';

import useAuthenticated from 'hooks/useAuthenticated';
import usePaginator from 'hooks/usePaginator';

import LoginToCreatePostCTA from 'components/shared/LoginToCreatePostCTA';
import PostImageLinkMessage from 'components/shared/PostimageLinkMessage';
import Section from 'components/shared/Section';
import RichEditor from 'components/shared/RichEditor';
import SortOptionsBar, { defaultOrder } from 'components/shared/SortOptionsBar';
import UberPaginator from 'components/shared/UberPaginator';

import client from 'client';

import commentQuery from '../queries/comment.gql';
import commentableCommentsQuery from '../queries/commentableComments.gql';
import commentableCommentsSummary from '../queries/commentableCommentsSummary.gql';
import updateCommentMutation from '../queries/updateComment.gql';
import deleteCommentMutation from '../queries/deleteComment.gql';
import createCommentMutation from '../queries/createComment.gql';

import Comment from './Comment';

export default function Comments({
  commentableId,
  commentableType,
  canModerate,
  canComment,
  onCommented,
  onDeletedComment
}) {
  const [order, setOrder] = useState(defaultOrder);
  const authenticated = useAuthenticated();
  const editor = React.createRef();

  const summaryQuery = {
    query: commentableCommentsSummary,
    dataKey: 'commentableCommentsSummary',
    variables: {
      commentable: {
        commentableId,
        commentableType
      }
    }
  };

  const itemsQuery = {
    query: commentableCommentsQuery,
    dataKey: 'commentableComments',
    variables: {
      commentable: {
        commentableId,
        commentableType
      },
      order
    }
  };

  const { paginatorProps, items: commentableComments, loading, refetch, updateQuery } = usePaginator({
    summaryQuery, itemsQuery
  });

  return (
    <>
      <Section basic loading={loading}>
        <SortOptionsBar
          order={order}
          visible={!(loading) && !(_.isEmpty(commentableComments))}
          onChange={setOrder}
        />

        <UberPaginator {...paginatorProps} />

        <CommentsRenderer
          comments={commentableComments}
          canModerate={canModerate}
          onAddComment={handleAddedComment}
          onDeleteComment={handleDeleteComment}
          onUpdateComment={handleUpdateComment}
          onReloadComment={handleReloadComment}
        />

        {canComment && authenticated && (<NoCommentsYet visible={!loading && _.isEmpty(commentableComments)} />)}
        {canComment && !(authenticated) && <LoginToCreatePostCTA onLoggedIn={refetch} cta="add a Comment" />}
      </Section>

      {authenticated && canComment && (
        <Segment>
          <CreateComment
            editor={editor}
            onAddedComment={handleAddedComment}
          />
        </Segment>
      )}

      <UberPaginator {...paginatorProps} />
    </>
  );

  // private handlers

  function handleReloadComment(comment) {
    // re-query the updated comment using a network-only cache policy to
    // force reading off the server and to update the local cache store
    return client.query({
      fetchPolicy: 'network-only',
      query: commentQuery,
      variables: { id: comment.id }
    });
  }

  function handleUpdateComment(comment, newCommentContent) {
    return client
      .mutate({
        mutation: updateCommentMutation,
        variables: {
          id: comment.id,
          input: {
            comment: newCommentContent
          }
        }
      });
  }

  function handleAddedComment(comment) {
    return Bluebird.resolve(
      client.mutate({
        mutation: createCommentMutation,
        variables: {
          input: {
            commentableId,
            commentableType,
            comment
          }
        }
      }))
      .tap(onCommented)
      .then(({ data: { createComment } }) => createComment)
      .then(createComment => updateQuery(prev => ({
        commentableComments: [
          ...(prev.commentableComments || []),
          createComment
        ]
      }))
      );
  }

  function handleDeleteComment(deletedComment) {
    return Bluebird.resolve(
      client
        .mutate({
          mutation: deleteCommentMutation,
          variables: {
            id: deletedComment.id
          }
        })
    )
      .tap(() => setTimeout(() => onDeletedComment()))
      .then(() => updateQuery(prev => ({
          commentableComments: _.reject(prev.commentableComments, { id: deletedComment.id })
        })))
      ;
  }
}

Comments.defaultProps = {
  canModerate: false,
  canComment: false
};

Comments.propTypes = {
  commentableId: PropTypes.string.isRequired,
  commentableType: PropTypes.string.isRequired,
  canModerate: PropTypes.bool,
  canComment: PropTypes.bool,
  onCommented: PropTypes.func.isRequired,
  onDeletedComment: PropTypes.func.isRequired
};

function CreateComment({ onAddedComment, editor }) {
  const [hasContent, setHasContent] = useState();
  const [saving, setSaving] = useState();

  return (
    <div className="create-message" data-cy="create-message">
      <Form>
        <Form.Field>
          <label>Add a comment</label>
          <PostImageLinkMessage visible />
          <RichEditor
            id="add-commentable-comment"
            ref={editor}
            placeholder="Add your comments..."
            onChange={handleOnChange}
          />
        </Form.Field>

        <Button
          primary
          loading={saving}
          onClick={handleAddContent}
          disabled={!(hasContent)}
        >
          Comment
        </Button>
      </Form>
    </div>
  );

  function handleOnChange(data) {
    if (data.hasContent !== hasContent) {
      setHasContent(data.hasContent);
    }
  }

  function handleAddContent() {
    if (hasContent) {
      const commentContent = editor.current.getEditorMessage();

      setSaving(true);

      return Bluebird
        .resolve(onAddedComment(commentContent))
        .then(() => {
          editor.current.clear();
          setSaving(false);
        })
        .finally(() => setSaving(false));
    }
  }
}

CreateComment.propTypes = {
  onAddedComment: PropTypes.func.isRequired,
  editor: PropTypes.object.isRequired
};

function CommentsRenderer({ comments, canModerate, onUpdateComment, onAddComment, onDeleteComment, onReloadComment }) {
  return (
    <div className="commentable-comments">
      <Transition.Group>
        {_.map(comments, comment => (
          <Segment key={`segment-${comment.id}`} data-cy-comment-id={comment.id}>
            <Comment
              key={`comment-${comment.id}`}
              comment={comment}
              canModerate={canModerate}
              canEdit={canModerate}
              onUpdateComment={onUpdateComment}
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
              onReloadComment={onReloadComment}
            />
          </Segment>
        ))}
      </Transition.Group>
    </div>
  );
}

CommentsRenderer.defaultProps = {
  comments: null,
  canModerate: false
};

CommentsRenderer.propTypes = {
  comments: PropTypes.array,
  canModerate: PropTypes.bool,
  onUpdateComment: PropTypes.func.isRequired,
  onAddComment: PropTypes.func.isRequired,
  onDeleteComment: PropTypes.func.isRequired,
  onReloadComment: PropTypes.func.isRequired
};

function NoCommentsYet({ visible }) {
  return visible && (
    <Message info>
      <Message.Header>No comments yet</Message.Header>
      <p>Be the the first to comment!</p>
    </Message>
  );
}

NoCommentsYet.defaultProps = {
  visible: false
};

NoCommentsYet.propTypes = {
  visible: PropTypes.bool
};
