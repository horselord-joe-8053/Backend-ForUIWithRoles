const logger = require('../../utils/logger');
const fileUtils = require('../../utils/file-utils');

exports.getData = () => {
  const dir = './app/dataInitialization/staff';
  // thid directory path needs to be relative to the location of executable such as server.js
  return fileUtils.getCombinedJsonObjectsFromDir(dir);
};
