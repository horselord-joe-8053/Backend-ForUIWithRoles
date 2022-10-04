const logger = require('../../utils/logger');
const fileUtils = require('../../utils/file-utils');

exports.getData = () => {
  const dir = './app/dataInitialization/linkedVideos';
  // thid directory path needs to be relative to the location of executable such as server.js
  const mergedJson = fileUtils.getMergedJsonArraysFromDir(dir);

  logger.logAsJsonStr('linkedVideo-initializer', 'mergedJson', mergedJson);

  return mergedJson;
};
