import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'semantic-ui-react';

import useMedia, { mobile } from 'hooks/useMedia';
import noop from 'services/noop';

import LoginSignupModal from 'components/shared/Modals/LoginSignup';
import GAEventReporter from 'components/shared/GAEventReporter';


const mobileProps = { vertical: true, fluid: true };
const tableProps = {};

export default function Buttons({
  errors,
  submitting,
  resetForm,
  saveAction,
  canSaveAsCopy,
  onSaveCopy,
  onSubmit,
  onPrint,
  onPrintPreview
}) {
  const hasErrors = errors?.length > 0;
  const isMobile = useMedia(mobile);
  const groupProps = isMobile ? mobileProps : tableProps;
  const ButtonsWrapper = isMobile ? Button.Group : React.Fragment;

  return (
    <ButtonsWrapper {...groupProps}>
      <LoginSignupModal>
        <Button
          icon
          primary
          labelPosition="left"
          disabled={hasErrors || submitting}
          loading={submitting}
          onClick={onSubmit}
        >
          <Icon name="save" />
          {saveAction} Recipe
        </Button>
      </LoginSignupModal>

      {canSaveAsCopy && (
        <Button
          icon
          type="button"
          labelPosition="left"
          disabled={hasErrors || submitting}
          loading={submitting}
          onClick={onSaveCopy}
        >
          <Icon name="copy" />
          Save as Copy
        </Button>
      )}

      <GAEventReporter
        category="Recipes"
        action="printRecipe"
      >
        <Button icon type="button" labelPosition="left" disabled={submitting} onClick={onPrint}>
          <Icon name="print" />
          Print Recipe
        </Button>
      </GAEventReporter>

      <GAEventReporter
        category="Recipes"
        action="printPreviewRecipe"
      >
        <Button icon type="button" labelPosition="left" disabled={submitting} onClick={onPrintPreview}>
          <Icon name="tv" />
          Print Preview Recipe
        </Button>
      </GAEventReporter>

      <GAEventReporter
        category="Recipes"
        action="resetRecipe"
      >
        <Button
          icon
          type="button"
          negative
          labelPosition="left"
          disabled={submitting}
          onClick={resetForm}
        >
          <Icon name="file outline" />
          Reset Recipe
        </Button>
      </GAEventReporter>
    </ButtonsWrapper>
  );
}

Buttons.defaultProps = {
  errors: null,
  submitting: false,
  canSaveAsCopy: false,
  onSaveCopy: noop
};

Buttons.propTypes = {
  errors: PropTypes.array,
  submitting: PropTypes.bool,
  resetForm: PropTypes.func.isRequired,
  saveAction: PropTypes.string.isRequired,
  canSaveAsCopy: PropTypes.bool,
  onSaveCopy: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  onPrint: PropTypes.func.isRequired,
  onPrintPreview: PropTypes.func.isRequired
};
