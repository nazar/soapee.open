import React from 'react';
import PropTypes from 'prop-types';

import { Button, Popup } from 'semantic-ui-react';

import GAEventReporter from 'components/shared/GAEventReporter';

export default function AdminControls({ onDelete }) {
  return (
    <Popup
      trigger={<Button basic size="mini" color="red" icon="th" data-cy="moderator-comment-button" />}
      content={<PopupContent />}
      on="click"
      position="top right"
    />
  );

  function PopupContent(props) {
    return (
      <Button.Group vertical {...props}>
        <GAEventReporter
          category="Comments"
          action="adminDeleteComment"
        >
          <Button
            labelPosition="left"
            color="red"
            icon="times"
            content="Delete Comment"
            data-cy="admin-controls-delete-comment"
            onClick={onDelete}
          />
        </GAEventReporter>
      </Button.Group>
    );
  }
}

AdminControls.propTypes = {
  onDelete: PropTypes.func.isRequired
};
