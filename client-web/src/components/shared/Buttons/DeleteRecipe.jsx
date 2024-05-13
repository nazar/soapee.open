import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Bluebird from 'bluebird';
import { Button, Modal, Header } from 'semantic-ui-react';

import GAEventReporter from 'components/shared/GAEventReporter';


export default function DeleteRecipe({ recipeName, onDelete }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState();

  return (
    <span className="button-delete-recipe" data-cy="button-delete-recipe">
      <Modal
        open={open}
        centered={false}
        onClose={handleCancel}
        data-cy="delete-recipe-modal"
        trigger={(
          <DeleteRecipeButton
            recipeName={recipeName}
            onClick={handleConfirm}
          />
        )}
      >
        <Modal.Header>Report Content</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Header>Confirm Recipe Delete</Header>
            <p>Are you sure you want do delete Recipe <strong>{recipeName}</strong>?</p>

            <Button primary loading={deleting} onClick={handleDelete}>Delete</Button>
            <Button secondary onClick={handleCancel}>Cancel</Button>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    </span>
  );

  function handleCancel() {
    setOpen(false);
  }

  function handleConfirm() {
    setOpen(true);
  }

  function handleDelete() {
    setDeleting(true);

    return Bluebird
      .resolve(onDelete())
      .then(() => setOpen(false))
      .catch(() => setDeleting(false));
  }
}

DeleteRecipe.propTypes = {
  recipeName: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired
};

function DeleteRecipeButton({ recipeName, ...rest }) {
  return (
    <GAEventReporter
      category="Recipes"
      action="deleteRecipe"
      label={recipeName}
    >
      <Button
        basic
        color="red"
        size="mini"
        data-cy="modal-recipe-delete-button"
        {...rest}
      >
        Delete
      </Button>
    </GAEventReporter>
  );
}

DeleteRecipeButton.propTypes = {
  recipeName: PropTypes.string.isRequired
};
