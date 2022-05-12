const mongoose = require('mongoose');

const Staff = mongoose.model(
  'Staff',
  new mongoose.Schema({
    firstName: String,
    lastName: String,
    shorthandName: String,
    hasCashPay: { type: String, default: 'No' }, // NOTE: mongoose default value: https://stackoverflow.com/a/34027357
  })
);

module.exports = Staff;
