import fs from 'fs';
import path from 'path';

import md5 from 'md5';
import Bluebird from 'bluebird';
import folderSize from 'get-folder-size';
import branchy from 'branchy';
import { transaction } from 'objection';

import Image from 'models/image';
import { uploadFileToTmpFile } from 'services/stream';

import getImagePath from '../image/getImagePath';

import clearUserImageUserProfile from './clearUserImageUserProfile';

const updateAvatarImageFork = require('./updateAvatarImageFork');

const updateAvatarImageForkBranched = branchy(updateAvatarImageFork);

export default async function updateAvatarImage({ input: { file, sizeData }, user }) {
  const { filename } = await file;
  const trx = await transaction.start(Image.knex());

  return new Bluebird(async (resolve, reject) => {
    try {
      await clearUserImageUserProfile({ user, trx });

      const filenameToSave = `${md5(filename)}.jpg`;

      const image = await Image
        .query(trx)
        .insert({
          fileName: filenameToSave,
          userId: user.id,
          imageableId: user.id,
          imageableType: 'user_profile',
          storage: 0
        });

      const imageFileName = getImagePath(image);
      const imageFileDir = path.dirname(imageFileName);

      await fs.promises.mkdir(imageFileDir, { recursive: true });
      const streamTmpFile = await uploadFileToTmpFile(file);

      return Bluebird
        .resolve(updateAvatarImageForkBranched({ sizeData, streamTmpFile, outputImageFileName: imageFileName }))
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
    })
    .tap(() => trx.commit())
    .tapCatch(() => trx.rollback());
}
