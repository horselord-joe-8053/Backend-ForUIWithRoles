const mongoose = require('mongoose');

const Staff = mongoose.model(
  'Staff',
  new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    shorthandName: { type: String, required: true, unique: true },
    // we are making this to be unique because
    // 0. we will use these value as query ref point for initializing other objects such as ShiftsInADay
    // 1. they will need to be shown in the same dropdown list
    // 2. save us from adding another field that will need UI and User to populate
  })
);

module.exports = Staff;
