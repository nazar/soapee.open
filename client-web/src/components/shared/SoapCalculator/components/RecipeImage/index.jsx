import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Cropper from 'react-cropper';
import { Button, Grid, Image, Message } from 'semantic-ui-react';

import './style.styl';


const aspectRatio = 700 / 467;
const maxImageSize = 4e6;

export default function RecipeImage({ recipe, onSetImage }) {
  const fileInputRef = React.createRef();
  const [updatingImage, setUpdatingImage] = useState();
  const [imagePreview, setImagePreview] = useState(recipe?.recipeImage);
  const [recipeImage, setRecipeImage] = useState();
  const [cropper, setCropper] = useState();
  const [croppedImagePreview, setCroppedImagePreview] = useState(recipe?.recipeImage);
  const [saving, setSaving] = useState();
  const [fileTooLarge, setFileTooLarge] = useState();

  return (
    <Grid className="calculator-recipe-image-component">
      <Grid.Row>
        {!(updatingImage) && (
          <Grid.Column>
            {croppedImagePreview && (
              <Image
                rounded
                className="cropped-review-recipe-image"
                src={croppedImagePreview}
                data-cy="cropped-review-recipe-image"
              />
            )}

            <input
              hidden
              ref={fileInputRef}
              type="file"
              accept=".jpg, .jepg, .png, .gif"
              data-cy="recipe-image-upload-input"
              onChange={handleAddedFile}
            />

            <Button
              secondary
              data-cy="recipe-image-upload-button"
              onClick={handleUploadClick}
            >
              Load Recipe image
            </Button>

            {recipe?.recipeImage && (
              <Button
                negative
                onClick={handleClearImage}
              >
                Clear Image
              </Button>
            )}
          </Grid.Column>
        )}

        {updatingImage && (
          <Grid.Column>
            <Cropper
              responsive
              className="recipe-image-cropper"
              zoomTo={0.1}
              initialAspectRatio={aspectRatio}
              aspectRatio={aspectRatio}
              src={imagePreview}
              viewMode={3}
              minCropBoxHeight={93}
              minCropBoxWidth={140}
              background={false}
              autoCropArea={1}
              checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
              onInitialized={setCropper}
            />
          </Grid.Column>
        )}
      </Grid.Row>

      {fileTooLarge && (
        <Grid.Row>
          <Grid.Column>
            <Message
              negative
              content="Image file is too large. Please keep uploaded images under 2MB."
            />
          </Grid.Column>
        </Grid.Row>
      )}

      {updatingImage && (
        <Grid.Row>
          <Grid.Column>
            <Button
              secondary
              loading={saving}
              onClick={handleSetImage}
            >
              Save Image
            </Button>

            <Button
              secondary
              onClick={handleCancel}
            >
              Clear Image
            </Button>
          </Grid.Column>
        </Grid.Row>
      )}
    </Grid>
  );

  //

  function handleUploadClick() {
    return fileInputRef.current.click();
  }

  function handleAddedFile(e) {
    e.preventDefault();

    const { files, validity } = e.target;
    const reader = new FileReader();

    fileTooLarge && setFileTooLarge();

    if (files[0].size > maxImageSize) {
      setFileTooLarge(true);
    } else {
      reader.onload = function() {
        setImagePreview(reader.result);
        setUpdatingImage(true);
      };

      reader.readAsDataURL(files[0]);

      validity.valid && setRecipeImage(files[0]);
    }
  }

  function handleSetImage() {
    const imageData = cropper.getData(true);
    const recipeImageSizeData = {
      left: imageData.x,
      top: imageData.y,
      width: imageData.width,
      height: imageData.height
    };

    setSaving(true);

    setTimeout(() => {
      setCroppedImagePreview(cropper.getCroppedCanvas().toDataURL());
      setUpdatingImage();

      onSetImage({ recipeImageSizeData, recipeImage });
    }, 10);
  }

  function handleClearImage() {
    setCroppedImagePreview();
    onSetImage({ recipeImageSizeData: null, recipeImage: null });
  }

  function handleCancel() {
    setUpdatingImage();
  }
}

RecipeImage.propTypes = {
  recipe: PropTypes.object.isRequired,
  onSetImage: PropTypes.func.isRequired
};
