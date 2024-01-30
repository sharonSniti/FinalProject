const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  image: {
    data: Buffer, // Store binary image data
    contentType: String, 
  },
  color: {
    type: String, // Store color as hex value
    match: /^#([0-9a-f]{3}|[0-9a-f]{6})$/i, // Validate hex color format
  },
});

const Word = mongoose.model('Word', wordSchema);

module.exports = Word;
