const logger = require('../../utils/logger');
const fileUtils = require('../../utils/file-utils');
const Staff = require('../../models/staff.model');
const ShiftType = require('../../models/shiftType.model');

exports.getData = async () => {
  const dir = './app/dataInitialization/timesheets';
  // thid directory path needs to be relative to the location of executable such as server.js
  const mergedJsonArr = fileUtils.getMergedJsonArraysFromDir(dir);

  let convertedMergedJsonArr = [];

  logger.logAsJsonStr('timesheets', 'mergedJsonArr', mergedJsonArr);
  logger.logAsStr('timesheets', 'mergedJsonArr.length', mergedJsonArr.length);

  /*
  {
    "date": "2022-04-16",
    "office": {
      "staff": { "query": { "shorthandName": "Staff1" } },
      "shiftType": { "query": { "uniqueReadableId": "office_lump_fortnight_200" } }
    },
    "pcaAm": {
      "staff": { "query": { "shorthandName": "Staff3" } },
      "shiftType": { "query": { "uniqueReadableId": "pca_bank25x9" } }
    }
  }
*/

  // if (mergedJsonArr && mergedJsonArr.length > 0) {
  //   logger.logAsStr('timesheets', 'in if', '');

  // mergedJsonArr.forEach((shiftsOfADay, index) => {
  // for (const [index, shiftsOfADay] of mergedJsonArr) {
  // TODO: another loops?? (need to use await inside)

  // For all the dates
  for (let index = 0; index < mergedJsonArr.length; index++) {
    logger.logAsStr('timesheet-initializer.getData', 'in loop level 1 ... index', index);

    let dayShifts = mergedJsonArr[index];
    logger.logAsJsonStr('timesheets', 'in loop level 1 ... shifts of date', dayShifts['date']);
    logger.logAsJsonStr('timesheet-initializer.getData', 'shiftsOfADay', dayShifts);
    let convertedDayShifts = {};

    const shiftKeys = ['office', 'pca', 'cleaning', 'night'];

    // Within each date, for all shifts of a day (need a await inside; not using for ... in ... as we want the index (may be not necessary))
    for ([idx, [key, value]] of Object.entries(dayShifts).entries()) {
      // for (propKey in shiftsOfADay) {
      logger.logAsStr('timesheet-initializer.getData', 'in loop level 2 ... idx', idx);

      logger.logAsStr('timesheet-initializer.getData', 'in loop level 2 ... key', key);

      if (shiftKeys.includes(key.toLowerCase())) {
        let convertedValue = {};

        logger.logAsStr('timesheet-initializer.getData', 'in loop level 2 if... key', key);
        logger.logAsJsonStr('timesheet-initializer.getData', 'in loop level 2 if... value', value);

        let staffQuery = value['staff']['query'];
        logger.logAsJsonStr(
          'timesheet-initializer.getData',
          'in loop level 2 if... staffQuery',
          staffQuery
        );
        let staffPopulated = await Staff.findOne(staffQuery).exec();
        logger.logAsJsonStr(
          'timesheet-initializer.getData',
          'in loop level 2 if... staffPopulated',
          staffPopulated
        );
        convertedValue['staff'] = staffPopulated._id;

        let shiftTypeQuery = value['shiftType']['query'];
        let shiftTypePopulated = await ShiftType.findOne(shiftTypeQuery).exec();
        logger.logAsJsonStr(
          'timesheet-initializer.getData',
          'in loop level 2 if... shiftTypePopulated',
          shiftTypePopulated
        );
        convertedValue['shiftType'] = shiftTypePopulated._id;

        convertedDayShifts[key] = convertedValue;
      } else {
        convertedDayShifts[key] = value;
      }

      logger.logAsJsonStr('timesheet-initializer.getData', 'end of loop level 2, value', value);
    }

    logger.logAsStr('timesheet-initializer.getData', 'end of loop level 1 ... index', index);

    logger.logAsJsonStr(
      'timesheet-initializer.getData',
      'end of loop level 1, shiftsOfADay',
      dayShifts
    );

    convertedMergedJsonArr.push(convertedDayShifts);
  }
  // }

  logger.logAsJsonStr(
    'timesheet-initializer.getData',
    'end of function, convertedMergedJsonArr',
    convertedMergedJsonArr
  );

  return convertedMergedJsonArr;
};
