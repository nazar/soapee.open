import fs from 'fs';
import path from 'path';

import Bluebird from 'bluebird';

// eslint-disable-next-line import/prefer-default-export
export function uploadFileToTmpFile(file) {
  return new Bluebird(async (resolve, reject) => {
    try {
      const { createReadStream, filename } = await file;

      const readStream = createReadStream();
      const tmpFile = path.join('/tmp', `${Date.now()}_${filename}`);
      const writeStream = fs.createWriteStream(tmpFile);

      writeStream.on('finish', () => resolve(tmpFile));

      readStream.pipe(writeStream);
    } catch (e) {
      reject(e);
    }
  });
}
