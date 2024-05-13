import fs from 'fs';
import path from 'path';

import Bluebird from 'bluebird';

import Image from 'models/image';

import getImagePath from './getImagePath';

export default function clearImageable({ imageableId, imageableType, trx }) {
  return Bluebird
    .resolve(
      Image
        .query(trx)
        .where({
          imageableId,
          imageableType
        })
    )
    .each((image) => {
      const imagePath = getImagePath(image);
      const imageFileDir = path.dirname(imagePath);

      return fs.promises.rmdir(imageFileDir, { recursive: true });
    })
    .then(() => Image
      .query(trx)
      .delete()
      .where({
        imageableId,
        imageableType
      }));
}
