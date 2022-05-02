const mongoose = require('mongoose');
const { Schema } = mongoose;

const ShiftsInADay = mongoose.model(
  'ShiftsInADay',
  new Schema({
    // TODO: read https://www.mongodb.com/docs/manual/indexes/#Indexes-SparseIndexes
    date: { type: Date, index: { unique: true } },
    // pcaAm: Staff,
    // pcaPm: Staff,
    // cleaning: Staff,
    // night: Staff,
    office: { type: Schema.Types.ObjectId, ref: 'Staff' },
    pcaAm: { type: Schema.Types.ObjectId, ref: 'Staff' },
    pcaPm: { type: Schema.Types.ObjectId, ref: 'Staff' },
    cleaning: { type: Schema.Types.ObjectId, ref: 'Staff' },
    night: { type: Schema.Types.ObjectId, ref: 'Staff' },
  })
);

module.exports = ShiftsInADay;
