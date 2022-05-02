const staff1_data = require('./staff1.json');
const staff2_data = require('./staff2.json');
const staff3_data = require('./staff3.json');
const staff4_data = require('./staff4.json');
const staff5_data = require('./staff5.json');
const staff6_data = require('./staff6.json');
const staff7_data = require('./staff7.json');

const logger = require('../../utils/logger');

exports.getData = () => {
  let combined = [
    staff1_data,
    staff2_data,
    staff3_data,
    staff4_data,
    staff5_data,
    staff6_data,
    staff7_data,
  ];

  logger.logAsJsonStr('staff-initializer.getData', 'combined', combined, 'debug');

  return combined;
};
