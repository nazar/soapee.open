import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Bluebird from 'bluebird';
import Cropper from 'react-cropper';
import { Form, Button, Header, Message, Segment, Card, Image, Grid } from 'semantic-ui-react';
import { useHistory } from 'react-router-dom';
import * as yup from 'yup';

import client from 'client';
import useCurrentUser from 'hooks/useCurrentUser';
import { clearAuthToken, isLocalUser } from 'services/token';
import { errorHasExceptionCode } from 'services/apollo';

import DeleteAccountDescription from 'components/shared/DeleteAccountDescription';
import PostImageLinkMessage from 'components/shared/PostimageLinkMessage';
import Section from 'components/shared/Section';
import { useForm, Input, RichEdit, ErrorMessage } from 'components/shared/Form';

import updateMeMutation from '../queries/updateMe.gql';
import updatePasswordMutation from '../queries/updatePassword.gql';
import deleteMyAccountMutation from '../queries/deleteMyAccount.gql';

import updateAvatarImageMutation from './updateAvatarImage.gql';
import './style.styl';


const maxImageSize = 4e6;

export default function Profile() {
  const currentUser = useCurrentUser();
  const localUser = isLocalUser();

  return (currentUser && (
    <div className="settings-profile">
      <Header as="h2">My Profile</Header>

      <Segment>
        <UserDetailsForm currentUser={currentUser} localUser={localUser} />
      </Segment>

      <Segment>
        <ProfileImage currentUser={currentUser} />
      </Segment>

      {localUser && (
        <Segment>
          <PasswordUpdateForm />
        </Segment>
      )}

      <Segment>
        <DeleteMyAccount />
      </Segment>
    </div>
  )) || null;
}

function UserDetailsForm({ currentUser, localUser }) {
  const { register, submitForm, submitting, valid } = useForm({
    initialValues: currentUser,
    validation: profileValidationSchema,
    onSubmit: handleSubmit
  });

  return (
    <Form onSubmit={submitForm}>
      <Header as="h3">Update my details</Header>

      <Form.Field>
        <label>Name</label>
        <Input required name="name" placeholder="Name" register={register} />
        <ErrorMessage first name="name" register={register} />
      </Form.Field>

      {localUser && (
        <Form.Field>
          <label>Email</label>
          <Input placeholder="Email" name="email" register={register} />
          <ErrorMessage first name="email" register={register} />
          <Message>
            Email isn't a required field but is required to reset passwords if you've signed up
            using username and password instead of the Google login button.
          </Message>
        </Form.Field>
      )}

      <Form.Field>
        <label>About me</label>
        <PostImageLinkMessage visible />
        <RichEdit id="about" name="about" register={register} />
        <ErrorMessage first name="about" register={register} />
      </Form.Field>

      <Button primary loading={submitting} disabled={!(valid)}>Save</Button>
    </Form>
  );

  function handleSubmit(values) {
    return client.mutate({
      mutation: updateMeMutation,
      variables: {
        input: values
      }
    });
  }
}

UserDetailsForm.defaultProps = {
  localUser: false
};

UserDetailsForm.propTypes = {
  currentUser: PropTypes.object.isRequired,
  localUser: PropTypes.bool
};

function ProfileImage({ currentUser }) {
  const fileInputRef = React.createRef();
  const [updatingImage, setUpdatingImage] = useState();
  const [imagePreview, setImagePreview] = useState(currentUser.canonicalImage);
  const [imageToSave, setImageToSave] = useState();
  const [cropper, setCropper] = useState();
  const [saving, setSaving] = useState();
  const [fileTooLarge, setFileTooLarge] = useState();

  return (
    <Grid className="settings-profile-profile-image" columns={updatingImage ? 2 : 1}>
      <Grid.Row>
        {!(updatingImage) && (
          <Grid.Column>
            <Header as="h3">Profile Avatar</Header>

            <Card data-cy="user-card">
              <Image className="card-profile-image" src={imagePreview} />
              <Card.Content>
                <Card.Header>{currentUser.name}</Card.Header>
              </Card.Content>
            </Card>

            <input
              hidden
              ref={fileInputRef}
              type="file"
              accept=".jpg, .jepg, .png, .gif"
              data-cy="profile-image-upload-input"
              onChange={handleAddedFile}
            />

            <Button
              primary
              data-cy="profile-image-upload-button"
              onClick={handleUpload}
            >
              Upload Profile Avatar
            </Button>
          </Grid.Column>
        )}

        {updatingImage && (
          <Grid.Column className="card-profile-image-preview-container">
            <Card data-cy="user-card-preview">
              <div className="card-profile-image-preview" />
              <Card.Content>
                <Card.Header>{currentUser.name}</Card.Header>
              </Card.Content>
            </Card>

            <Button
              primary
              className="big-top"
              loading={saving}
              data-cy="profile-image-update-button"
              onClick={handleFileUpload}
            >
              Update Profile Avatar
            </Button>

            <Button
              secondary
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Grid.Column>
        )}

        {updatingImage && (
          <Grid.Column>
            <Cropper
              responsive
              zoomTo={0.1}
              initialAspectRatio={1}
              aspectRatio={1}
              preview=".card-profile-image-preview"
              src={imagePreview}
              viewMode={3}
              minCropBoxHeight={10}
              minCropBoxWidth={10}
              background={false}
              autoCropArea={1}
              checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
              onInitialized={setCropper}
            />
          </Grid.Column>
        )}

        {fileTooLarge && (
          <Grid.Column className="big-top">
            <Message
              negative
              content="Image file is too large. Please keep uploaded images under 2MB."
            />
          </Grid.Column>
        )}
      </Grid.Row>
    </Grid>
  );

  //

  function handleUpload() {
    return fileInputRef.current.click();
  }

  function handleAddedFile(e) {
    e.preventDefault();

    const { files, validity } = e.target;

    fileTooLarge && setFileTooLarge();

    if (files[0].size > maxImageSize) {
      setFileTooLarge(true);
    } else {
      const reader = new FileReader();

      reader.onload = function() {
        setImagePreview(reader.result);
        setUpdatingImage(true);
      };

      reader.readAsDataURL(files[0]);

      validity.valid && setImageToSave(files[0]);
    }
  }

  function handleFileUpload() {
    const imageData = cropper.getData(true);

    setSaving(true);

    return client
      .mutate({
        mutation: updateAvatarImageMutation,
        variables: {
          input: {
            file: imageToSave,
            sizeData: {
              left: imageData.x,
              top: imageData.y,
              width: imageData.width,
              height: imageData.height
            }
          }
        }
      })
      .then(({ data: { updateAvatarImage: { canonicalImage } } }) => {
        setSaving();
        setUpdatingImage();
        setImagePreview(canonicalImage);
        setImageToSave();
      });
  }

  function handleCancel() {
    setUpdatingImage();
  }
}

ProfileImage.propTypes = {
  currentUser: PropTypes.object.isRequired
};

function PasswordUpdateForm() {
  const [updated, setUpdated] = useState(false);
  const [mismatched, setMismatched] = useState(false);

  const { register, submitForm, submitting, valid, resetForm } = useForm({
    validation: passwordValidationSchema,
    onSubmit: handleSubmit
  });

  return (
    <>
      <Form onSubmit={submitForm}>
        <Header as="h3">Update my password</Header>

        <Form.Field>
          <label>Current Password</label>
          <Input
            required
            name="currentPassword"
            type="password"
            placeholder="Current Password"
            register={register}
          />
          <ErrorMessage first name="currentPassword" register={register} />
        </Form.Field>

        <Form.Field>
          <label>New Password</label>
          <Input
            required
            placeholder="New Password"
            name="newPassword"
            type="password"
            register={register}
          />
          <ErrorMessage first name="newPassword" register={register} />
        </Form.Field>

        <Form.Field>
          <label>Confirm New Password</label>
          <Input
            required
            placeholder="Confirm New Password"
            name="confirmPassword"
            type="password"
            register={register}
          />
          <ErrorMessage first name="confirmPassword" register={register} />
        </Form.Field>

        <Button primary loading={submitting} disabled={!(valid)}>Update Password</Button>
      </Form>

      {updated && (
        <Message
          positive
          header="Confirmation"
          content="Password updated successfully."
          onDismiss={handleDismiss}
        />
      )}

      {mismatched && (
        <Message
          negative
          content="The entered Password doesn't match your existing password"
        />
      )}
    </>

  );

  //

  function handleDismiss() {
    return setUpdated(false);
  }

  function handleSubmit(values) {
    const { currentPassword, newPassword } = values;

    return Bluebird.resolve(
      client.mutate({
        mutation: updatePasswordMutation,
        variables: {
          input: { currentPassword, newPassword }
        }
      })
    )
      .then(() => {
        resetForm();
        setMismatched(false);
        setUpdated(true);
      })
      .catch((e) => {
        if (errorHasExceptionCode(e, 'password_mismatch')) {
          setMismatched(true);
        } else {
          throw e;
        }
      });
  }
}

function DeleteMyAccount() {
  const [showDeleteWarning, setShowDeleteWarning] = useState();
  const history = useHistory();

  return (
    <div className="delete-account">
      <Header as="h3">Delete My Account</Header>

      <Button
        negative
        onClick={handleToggleWarning}
        data-cy="delete-account"
      >
        Delete my Account
      </Button>

      {showDeleteWarning && (
        <Section>
          <div className="description">
            <DeleteAccountDescription />
          </div>
        </Section>
      )}

      {showDeleteWarning && (
        <Button
          negative
          onClick={doAccountDelete}
          data-cy="confirm-delete-account"
        >
          CONFIRM DELETE ACCOUNT
        </Button>
      )}
    </div>
  );

  //

  function handleToggleWarning() {
    setShowDeleteWarning(prev => !(prev));
  }

  function doAccountDelete() {
    return client
      .mutate({
        mutation: deleteMyAccountMutation
      })
      .then(() => {
        clearAuthToken();

        return client
          .resetStore()
          .then(() => history.replace('/'));
      });
  }
}

const profileValidationSchema = yup.object({
  name: yup.string().min(3).max(30).matches(/^[a-zA-Z0-9 ]*$/, { excludeEmptyString: true })
    .required(),
  email: yup.string().email().max(100)
    .nullable()
    .default(''),
  about: yup.string().nullable().default('')
});

const passwordValidationSchema = yup.object({
  currentPassword: yup.string().min(3).max(30).required().label('Current password')
    .default(''),
  newPassword: yup.string().min(3).max(30).required().label('New password')
    .default(''),
  confirmPassword: yup.string().min(3).max(30).required().label('Confirm new password')
    .test('match',
      'passwords do not match',
      function(value) {
        return value === this.parent.newPassword;
      }
    )
    .default('')
});
