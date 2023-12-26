const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  image: {
    data: Buffer, // Store binary image data
    contentType: String, // Store content type (e.g., image/jpeg, image/png, etc.)
  },
  partOfSpeech: {
    type: String,
  },
});

const Word = mongoose.model('Word', wordSchema);

module.exports = Word;
