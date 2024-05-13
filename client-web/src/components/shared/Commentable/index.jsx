import React from 'react';
import PropTypes from 'prop-types';

import noop from 'services/noop';
import Section from 'components/shared/Section';

import Comments from './components/Comments';

export default function Commentable({
  commentableType,
  commentableId,
  canComment,
  canModerate,
  onCommented,
  onDeletedComment
}) {
  return (
    <Section className="commentable">
      <Comments
        commentableType={commentableType}
        commentableId={commentableId}
        canModerate={canModerate}
        canComment={canComment}
        onCommented={onCommented}
        onDeletedComment={onDeletedComment}
      />
    </Section>
  );
}

Commentable.defaultProps = {
  canComment: false,
  canModerate: false,
  onCommented: noop,
  onDeletedComment: noop
};

Commentable.propTypes = {
  commentableType: PropTypes.string.isRequired,
  commentableId: PropTypes.string.isRequired,
  canComment: PropTypes.bool,
  canModerate: PropTypes.bool,
  onCommented: PropTypes.func,
  onDeletedComment: PropTypes.func
};
