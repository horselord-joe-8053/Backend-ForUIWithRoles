const staff1_data = require('./staff1.json');
const staff2_data = require('./staff2.json');

const logger = require('../../utils/logger');

exports.getData = () => {
  let combined = [staff1_data, staff2_data];

  logger.logAsJsonStr('staff-initializer.getData', 'combined', combined);

  return combined;
};
