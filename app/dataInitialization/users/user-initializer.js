const logger = require('../../utils/logger');
const fileUtils = require('../../utils/file-utils');
const encryptUtils = require('../../utils/encrypt-utils');
const Role = require('../../models/role.model');

exports.getData = async () => {
  const dir = './app/dataInitialization/users';
  // thid directory path needs to be relative to the location of executable such as server.js
  const mergedJsonArr = fileUtils.getMergedJsonArraysFromDir(dir);

  let convertedMergedJsonArr = [];

  logger.logAsJsonStr('user', 'mergedJsonArr', mergedJsonArr);
  logger.logAsStr('user', 'mergedJsonArr.length', mergedJsonArr.length);

  /*
    [
      {
        "username": "admin123",
        "email": "admin123@email.com",
        "password": "admin@pwd321",
        "role": { "query": { "name": "admin" } }
      },
      ...
    ]
  */

  // For all the users
  for (let index = 0; index < mergedJsonArr.length; index++) {
    logger.logAsStr('user-initializer.getData', 'in loop ... index', index);

    let user = mergedJsonArr[index];
    // init convertedValue by omitting the property that will be converted:
    // https://stackoverflow.com/a/55112661
    const { role, password, ...convertedValue } = user;

    // Get foreign id key through query
    let roleQuery = user['role']['query'];
    let rolePopulated = await Role.findOne(roleQuery).exec();
    logger.logAsJsonStr('user-initializer.getData', 'in loop ... rolePopulated', rolePopulated);

    // Get encrypted password
    let passwordEncrypted = encryptUtils.encrypt(password);

    // add back the property that has been converted
    convertedValue['role'] = rolePopulated._id;
    convertedValue['password'] = passwordEncrypted;

    convertedMergedJsonArr.push(convertedValue);
  }

  logger.logAsJsonStr(
    'user-initializer.getData',
    'end of function, convertedMergedJsonArr',
    convertedMergedJsonArr
  );

  return convertedMergedJsonArr;
};
