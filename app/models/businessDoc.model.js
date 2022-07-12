const mongoose = require('mongoose');

const BusinessDoc = mongoose.model(
  'BusinessDoc',
  new mongoose.Schema({
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    pdfDocumentLink: { type: String, required: true },
    summary: { type: String, required: true },
    note: { type: String },
  })
);

module.exports = BusinessDoc;
