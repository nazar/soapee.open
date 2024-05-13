// this function is called as a forked function via branchy hence the
// need for __non_webpack_require__ and importing libs in the function body

module.exports = function ({ sizeData, streamTmpFile, imageFileName, thumbnailFileName }) {
  /* eslint-disable no-undef */
  const fs = __non_webpack_require__('fs');
  const sharp = __non_webpack_require__('sharp');
  const Bluebird =  __non_webpack_require__('bluebird');
  /* eslint-enable no-undef */

  return new Bluebird((resolve, reject) => {
    const readStream = fs.createReadStream(streamTmpFile);

    const pipeline = sharp()
      // https://sharp.pixelplumbing.com/api-resize#extract
      .extract(sizeData)
      .toFormat('jpeg', {
        quality: 80,
        mozjpeg: true
      });

    Bluebird.join(
      generateFullImage({ pipeline: pipeline.clone() }),
      generateThumbnail({ pipeline: pipeline.clone() }),
      resolve
    )
      .catch(reject)
      .finally(() => readStream.destroy());

    readStream.pipe(pipeline);
  });

  //

  function generateFullImage({ pipeline }) {
    return new Bluebird((resolve, reject) => {
      const outputStream = fs.createWriteStream(imageFileName);

      outputStream.on('finish', resolve);
      outputStream.on('error', reject);

      pipeline.resize(700, 467).pipe(outputStream);
    });
  }

  function generateThumbnail({ pipeline }) {
    return new Bluebird((resolve, reject) => {
      const outputStream = fs.createWriteStream(thumbnailFileName);

      outputStream.on('finish', resolve);
      outputStream.on('error', reject);

      pipeline.resize(90, 60).pipe(outputStream);
    });
  }
};
