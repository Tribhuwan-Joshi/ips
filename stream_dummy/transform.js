const { Readable } = require('stream');
const sharp = require('sharp');
const transformImage = async () => {};

transformImage();

const addTransformation = (transformation) => {
  let transformer = sharp();
  if (transformation.resize) {
    transformer = transformer.resize({
      width: transformation.resize.width,
      height: transformation.resize.height,
    });
  }
  if (transformation.crop) {
    transformer = transformer.extract({
      left: transformation.crop.x,
      top: transformation.crop.y,
      width: transformation.crop.width,
      height: transformation.crop.height,
    });
  }
  if (transformation.rotate) {
    transformer = transformer.rotate(transformation.rotate);
  }
  if (transformation.format) {
    transformer = transformer.toFormat(transformation.format);
  }
  if (transformation.filters) {
    if (transformation.filters.grayscale) {
      transformer = transformer.grayscale();
    }
  }
  if (transformation.sharpen) {
    transformer = transformer.sharpen();
  }
  if (transformation.blur) {
    transformer = transformer.blur();
  }
  if (transformation.flip) {
    transformer = transformer.flip();
  }

  return transformer;
};
