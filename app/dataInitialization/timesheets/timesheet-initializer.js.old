const week1_data = require('./timesheet-week1.json');
const week2_data = require('./timesheet-week2.json');
const week3_data = require('./timesheet-week3.json');

const logger = require('../../utils/logger');

exports.getData = () => {
  let combined = [...week1_data, ...week2_data, ...week3_data];

  logger.logAsJsonStr('staff-initializer.getData', 'combined', combined, 'debug');

  return combined;
};
