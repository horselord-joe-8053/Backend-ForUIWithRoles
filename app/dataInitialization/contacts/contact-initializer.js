const logger = require('../../utils/logger');
const fileUtils = require('../../utils/file-utils');

exports.getData = () => {
  const dir = './app/dataInitialization/contacts';
  // thid directory path needs to be relative to the location of executable such as server.js
  const mergedJson = fileUtils.getMergedJsonArraysFromDir(dir);

  logger.logAsJsonStr('contact-initializer', 'mergedJson', mergedJson);

  return mergedJson;
};
