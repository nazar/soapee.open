import React from 'react';
import PropTypes from 'prop-types';
import { Button, Popup } from 'semantic-ui-react';

export default function AdminControls({ locked, onDelete, onLock, onUnlock }) {
  return (
    <Popup
      trigger={<Button basic size="mini" color="red" icon="th" data-cy="moderator-post-button" />}
      content={<PopupContent locked={locked} onDelete={onDelete} onLock={onLock} onUnlock={onUnlock} />}
      on="click"
      position="top right"
    />
  );
}

AdminControls.defaultProps = {
  locked: false
};

AdminControls.propTypes = {
  locked: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
  onLock: PropTypes.func.isRequired,
  onUnlock: PropTypes.func.isRequired
};

function PopupContent({ locked, onDelete, onLock, onUnlock, ...restProps }) {
  return (
    <Button.Group vertical {...restProps}>
      <Button labelPosition="left" color="red" icon="times" content="Delete Post" onClick={onDelete} />

      {locked && <Button labelPosition="left" color="red" icon="lock" content="Unlock Post" onClick={onUnlock} />}
      {!(locked) && <Button labelPosition="left" color="red" icon="lock" content="Lock Post" onClick={onLock} />}
    </Button.Group>
  );
}

PopupContent.defaultProps = {
  locked: false
};

PopupContent.propTypes = {
  locked: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
  onLock: PropTypes.func.isRequired,
  onUnlock: PropTypes.func.isRequired
};
