import path from 'path';

import config from 'config';

import getImagePathArray from './getImagePathArray';

export default function getImagePath(image, isThumbnail) {
  const basePath = config.get('images.basePath');
  const pathArray = getImagePathArray(image, isThumbnail);

  return path.join(basePath, ...pathArray);
}
