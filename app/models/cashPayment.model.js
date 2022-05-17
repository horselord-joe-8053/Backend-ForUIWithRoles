const mongoose = require('mongoose');
const { Schema } = mongoose;

const CashPayment = mongoose.model(
  'CashPayment',
  new Schema({
    staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    frequency: { type: String, required: true },
    hourlyRate: { type: Number, required: true },
    numOfHours: { type: Number, required: true },
    usedFor: { type: String, required: true },
  })
);

module.exports = CashPayment;
