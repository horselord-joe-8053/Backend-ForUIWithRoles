const mongoose = require('mongoose');
const { Schema } = mongoose;

const PaymentArrangement = mongoose.model(
  'PaymentArrangement',
  new Schema({
    staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    frequency: { type: String, required: true },
    // Cash Hourly Rate - need to get from these paymentArrangemententries.
    //    This is regardless of the type this paymentArrangement- the idea is
    //    we focus on get the number of hours to pay by cash by substracting the
    //    non-cash hours from the total, if this is an arrangement specified for
    //    'non-cash' hours (e.g. to meet the max tax threshold upon employee's requst)
    //    then multiple by the cash rate corresponding to the same paymentArrangement
    //    entry.
    cashHourlyRate: { type: Number, required: true },
    numOfHours: { type: Number, required: true },
    usedFor: { type: String, required: true },
    type: { type: String, required: true }, // 'cash' or 'non-cash'
  })
);

module.exports = PaymentArrangement;
