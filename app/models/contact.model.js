const mongoose = require('mongoose');

const Contact = mongoose.model(
  'Contact',
  new mongoose.Schema({
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    primaryNumber: { type: String, required: true },
    secondaryNumber: { type: String },
    email: { type: String },
    contactPersonName: { type: String },
    address: { type: String },
    operatingHours: { type: String },
    note: { type: String },
  })
);

module.exports = Contact;
