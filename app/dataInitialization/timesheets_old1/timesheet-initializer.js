const logger = require('../../utils/logger');
const fileUtils = require('../../utils/file-utils');

exports.getData = () => {
  const dir = './app/dataInitialization/timesheets';
  // thid directory path needs to be relative to the location of executable such as server.js
  const mergedJson = fileUtils.getMergedJsonArraysFromDir(dir);

  logger.logAsJsonStr('timesheets', 'mergedJson', mergedJson);

  /*
  {
    "date": "2022-04-16",
    "office": {
      "staff": { "query": { "shorthandName": "Jenny" } },
      "shiftType": { "query": { "uniqueReadableId": "office_lump_fortnight_200" } }
    },
    "pcaAm": {
      "staff": { "query": { "shorthandName": "Grace" } },
      "shiftType": { "query": { "uniqueReadableId": "pca_bank25x9" } }
    }
  }
*/

  return mergedJson;
};
