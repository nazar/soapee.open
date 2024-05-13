// this function is called as a forked function via branchy hence the
// need for __non_webpack_require__ and importing libs in the function body

module.exports = function ({ sizeData, streamTmpFile, outputImageFileName }) {
  /* eslint-disable no-undef */
  const fs = __non_webpack_require__('fs');
  const sharp = __non_webpack_require__('sharp');
  const Bluebird =  __non_webpack_require__('bluebird');
  /* eslint-enable no-undef */

  return new Bluebird((resolve, reject) => {
    const readStream = fs.createReadStream(streamTmpFile);
    const writeStream = fs.createWriteStream(outputImageFileName);

    const pipeline = sharp()
      // https://sharp.pixelplumbing.com/api-resize#extract
      .extract(sizeData)
      .resize(290, 290)
      .toFormat('jpeg', {
        quality: 80,
        mozjpeg: true
      });

    readStream.pipe(pipeline).pipe(writeStream);

    writeStream.on('finish', () => {
      try {
        writeStream.destroy();
        readStream.destroy();
      } catch (e) {
        reject({ message: 'Error destroying image streams', error: e });
      }

      resolve();
    });
  });
};
