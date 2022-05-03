const fs = require('fs');
const path = require('path');

const Logger = require('./logger');

// jjw: inspired from https://stackoverflow.com/a/61645820
// jjw: TODO: use these for staff and resident data init as well
exports.getCombinedJsonObjectsFromDir = (relativeDirPath) => {
  return getCombinedJsonFromDir(relativeDirPath);
};

exports.getMergedJsonArraysFromDir = (relativeDirPath) => {
  return getCombinedJsonFromDir(relativeDirPath, true);
};

// 'relativeDirPath' needs to be relative path to the executable such as server.js
const getCombinedJsonFromDir = (relativeDirPath, isArr = false) => {
  const jsonsInDir = fs
    .readdirSync(relativeDirPath)
    .filter((file) => path.extname(file) === '.json');

  var allJsonArr = [];
  jsonsInDir.forEach((file) => {
    const fileData = fs.readFileSync(path.join(relativeDirPath, file));
    const jsonContent = JSON.parse(fileData.toString());

    // logger.logAsJsonStr('timesheet-initializer.getData', 'file', file);
    // logger.logAsJsonStr('timesheet-initializer.getData', 'json', jsonArr);

    if (isArr) {
      // NOTE: append arr: https://stackoverflow.com/a/1374131
      allJsonArr.push(...jsonContent);
    } else {
      allJsonArr.push(jsonContent);
    }
  });

  Logger.logAsJsonStr('timesheet-initializer.getData', 'allJsonArr', allJsonArr, 'debug');
  Logger.logAsStr('timesheet-initializer.getData', 'allJsonArr.length', allJsonArr.length);

  return allJsonArr;
};
