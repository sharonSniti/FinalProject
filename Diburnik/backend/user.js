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
  salt: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  userType: { 
    type: String,
    enum: ['teacher', 'child'],
    required: true,
  },
  child: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child',
    },
  ],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
