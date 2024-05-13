import _ from 'lodash';

import getImagePathArray from './getImagePathArray';

export default function getImageUrl(image, isThumbnail) {
  return _.join([
    '/imageables',
    ...getImagePathArray(image, isThumbnail)
  ], '/');
}
