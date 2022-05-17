const mongoose = require('mongoose');
const { Schema } = mongoose;

const ShiftsInADay = mongoose.model(
  'ShiftsInADay',
  new Schema({
    // TODO: read https://www.mongodb.com/docs/manual/indexes/#Indexes-SparseIndexes
    date: { type: Date, required: true, index: { unique: true } }, // search by this field often
    // pcaAm: Staff,
    // pcaPm: Staff,
    // cleaning: Staff,
    // night: Staff,
    office: {
      staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
      shiftType: { type: Schema.Types.ObjectId, ref: 'ShiftType', required: true },
    },
    pca: {
      staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
      shiftType: { type: Schema.Types.ObjectId, ref: 'ShiftType', required: true },
    },
    // TODO: recover the following
    // pcaPm: {
    //   staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    //   shiftType: { type: Schema.Types.ObjectId, ref: 'ShiftType', required: true },
    // },
    cleaning: {
      staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
      shiftType: { type: Schema.Types.ObjectId, ref: 'ShiftType', required: true },
    },
    night: {
      staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
      shiftType: { type: Schema.Types.ObjectId, ref: 'ShiftType', required: true },
    },
  })
);

module.exports = ShiftsInADay;
