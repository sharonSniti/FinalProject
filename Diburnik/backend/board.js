const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  image: {
    data: Buffer, // Store binary image data
    contentType: String, // Store content type (e.g., image/jpeg, image/png, etc.)
  },
  words: [
    {
      type: String,
      required: true,
    },
  ],
});

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;
