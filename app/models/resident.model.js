const mongoose = require("mongoose");

const Resident = mongoose.model(
  "Resident",
  new mongoose.Schema({
    firstName: String,
    lastName: String,
    dob: Date,
    lastKnownPayDate: Date,
    payFrequency: {
      type: String,
      enum : ['fortnightly','monthly'],
      default: 'fortnightly'
    }
  })
);

module.exports = Resident;
