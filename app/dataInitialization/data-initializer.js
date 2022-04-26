const residentsInitializer = require('./residents/resident-initializer');
const staffInitializer = require('./staff/staff-initializer');

const logger = require('../utils/logger');

exports.getData = () => {
  let combined = {
    resident_data: residentsInitializer.getData(),
    staff_data: staffInitializer.getData(),
  };

  logger.logAsJsonStr('data-initializer.getData', 'ALL combined', combined);

  return combined;
};
