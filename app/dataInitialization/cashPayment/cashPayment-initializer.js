const logger = require('../../utils/logger');
const fileUtils = require('../../utils/file-utils');
const Staff = require('../../models/staff.model');

exports.getData = async () => {
  const dir = './app/dataInitialization/cashPayment';
  // thid directory path needs to be relative to the location of executable such as server.js
  const mergedJsonArr = fileUtils.getCombinedJsonObjectsFromDir(dir);

  let convertedMergedJsonArr = [];

  logger.logAsJsonStr('cashPayment.getData', 'mergedJsonArr', mergedJsonArr);
  logger.logAsStr('cashPayment.getData', 'mergedJsonArr.length', mergedJsonArr.length);

  /*
  [
    {
      "staff": { "query": { "shorthandName": "Grace" } },
      "frequency": "Fortnightly",
      "hourlyRate": 19,
      "numOfHours": 8,
      "usedFor": "pca"
    },
    ...
  ]
  */

  const propToConvertKeys = ['staff'];
  const propToConvertModels = [Staff];
  const queryKey = 'query';

  if (mergedJsonArr && mergedJsonArr.length > 0) {
    // For all the cashPayment arrangments
    for (let objIdx = 0; objIdx < mergedJsonArr.length; objIdx++) {
      // use this old-fashioned
      // 1. to perserve the order as before it's converted
      // 2. can't use forEach as there is an asycn wait inside
      let obj = mergedJsonArr[objIdx];

      // NOTE:
      // 1. we need a SHALLOW copy here as the only nested object is the first one which
      //    we are replacing anyway
      // 2. Object.assign() v.s. spread operator: https://stackoverflow.com/a/32926019
      //    both are not standardized, we will use the more versitle one?
      let convertedObj = { ...obj };

      // for (const propKey of propToConvertKeys) {
      for (let keyIdx = 0; keyIdx < propToConvertKeys.length; keyIdx++) {
        const propKey = propToConvertKeys[keyIdx];
        // use this old-fashioned
        // 1. to perserve the order as before it's converted
        // 2. can't use forEach as there is an asycn wait inside
        logger.logAsStr('cashPayment.getData', 'propKey', propKey);

        // convert from query to _id
        let query = obj[propKey][queryKey];
        let queryResult = await propToConvertModels[keyIdx].findOne(query).exec();
        logger.logAsJsonStr('cashPayment.getData', 'queryResult', queryResult);

        convertedObj[propKey] = queryResult._id;
      }

      convertedMergedJsonArr.push(convertedObj);
    }
  }

  logger.logAsJsonStr('cashPayment.getData', 'convertedMergedJsonArr', convertedMergedJsonArr);

  return convertedMergedJsonArr;
};
