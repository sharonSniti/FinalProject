const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  image: {
    data: Buffer, // Store binary image data
    contentType: String, // Store content type (e.g., image/jpeg, image/png, etc.)
  },
  boards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
    },
  ],
});

const Child = mongoose.model('Child', childSchema);

module.exports = Child;
