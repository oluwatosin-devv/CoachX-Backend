const mongoose = require('mongoose');
const validator = require('validator');
const { validate } = require('./userModel');

const waitlistschema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Waitlist must have a name'],
  },

  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide an email'],
    validate: [validator.isEmail, 'Provide a valid email'],
  },
});

const Waitlist = mongoose.model('Waitlist', waitlistschema);

module.exports = Waitlist;
