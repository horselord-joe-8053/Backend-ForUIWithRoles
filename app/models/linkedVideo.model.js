const mongoose = require('mongoose');

const LinkedVideo = mongoose.model(
  'LinkedVideo',
  new mongoose.Schema({
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    linkToVideo: { type: String, required: true }, // not making unique so that the same video link under different category is possible
    title: { type: String, required: true },
    description: { type: String },
    note: { type: String },
  })
);

module.exports = LinkedVideo;
