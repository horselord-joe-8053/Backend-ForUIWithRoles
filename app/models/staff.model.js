const mongoose = require('mongoose');

const Staff = mongoose.model(
  'Staff',
  new mongoose.Schema({
    firstName: String,
    lastName: String,
    shorthandName: String,
  })
);

module.exports = Staff;
