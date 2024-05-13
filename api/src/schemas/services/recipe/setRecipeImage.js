import fs from 'fs';
import path from 'path';

import md5 from 'md5';
import branchy from 'branchy';
import Bluebird from 'bluebird';
import folderSize from 'get-folder-size';

import Image from 'models/image';
import { uploadFileToTmpFile } from 'services/stream';

import getImagePath from '../image/getImagePath';

import clearRecipeImage from './clearRecipeImage';

const setRecipeImageFork = require('./setRecipeImageFork');

const setRecipeImageForkBranched = branchy(setRecipeImageFork);


export default function setRecipeImage({ recipeImage, recipeImageSizeData, user, recipe, trx }) {
  return new Bluebird(async (resolve, reject) => {
    try {
      const { filename } = await recipeImage;

      await clearRecipeImage({ recipe, trx });

      const filenameToSave = `${md5(filename)}.jpg`;

      const image = await Image
        .query(trx)
        .insert({
          fileName: filenameToSave,
          userId: user.id,
          imageableId: recipe.id,
          imageableType: 'recipes',
          storage: 0
        });

      const imageFileName = getImagePath(image);
      const thumbnailFileName = getImagePath(image, true);
      const imageFileDir = path.dirname(imageFileName);

      await fs.promises.mkdir(imageFileDir, { recursive: true });
      const streamTmpFile = await uploadFileToTmpFile(recipeImage);

      return Bluebird
        .resolve(setRecipeImageForkBranched({
          streamTmpFile,
          imageFileName,
          thumbnailFileName,
          sizeData: recipeImageSizeData
        }))
        .then(() => resolve({ image, imageFileDir }))
        .tapCatch(reject)
        .finally(() => fs.promises.unlink(streamTmpFile));
    } catch (e) {
      reject(e);
    }
  })
    .then(async ({ image, imageFileDir }) => {
      const storage = await Bluebird.promisify(folderSize)(imageFileDir);

      await image
        .$query(trx)
        .patch({ storage });

      return user;
    });
}
