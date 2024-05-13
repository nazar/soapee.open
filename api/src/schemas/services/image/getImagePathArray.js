import _ from 'lodash';

export default function getImagePathArray(image, isThumbnail) {
  const imagePrefix = isThumbnail ? 'thumb_' : '';

  return [
    image.imageableType,
    ...(_.words(_.padStart(image.id, 9, '0'), /\d{3}/g)),
    `${imagePrefix}${image.fileName}`
  ];
}
