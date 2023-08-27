const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  children: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child', // Reference the Child model
    },
  ],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
