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
    },
    paymentAmount: Number,
    isDiabetic: String, //jjw: TODO: ideally boolean but frontend is using 'yes', 'no', the conversion has to happen somewhere in expense of generality 
    moveInDate: Date
  })
);

module.exports = Resident;
