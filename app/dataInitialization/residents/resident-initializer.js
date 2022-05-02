const resident1_data = require('./resident1.json');
const resident2_data = require('./resident2.json');

const logger = require('../../utils/logger');

exports.getData = () => {
  let combined = [
    resident1_data,
    // resident2_data
  ];

  logger.logAsJsonStr('resident-initializer.getData', 'combined', combined, 'debug');

  return combined;
};
