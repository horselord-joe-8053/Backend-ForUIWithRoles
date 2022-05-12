const mongoose = require('mongoose');

const ShiftType = mongoose.model(
  'ShiftType',
  new mongoose.Schema({
    payMethod: String,
    taxWithholdingType: String,
    hourlyRate: Number,
    numOfHours: Number,
    // usedFor: { type: [String], default: undefined }, // NOTE: e.g. ['pcaAm', 'pcaPm']: https://stackoverflow.com/a/46157449
    usedFor: String, // reduce unnecessary complexity and not use an arr
    isDisplayShortHand: { type: Boolean, default: false },
    displayShortHand: String,
    isInUse: { type: Boolean, default: false }, // NOTE: mongoose default value: https://stackoverflow.com/a/34027357
  })
);

module.exports = ShiftType;
