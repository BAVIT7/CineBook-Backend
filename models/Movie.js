
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  genre: {
    type: String,
    required: true
  },

  language: {
    type: String,
    required: true,
    enum: ['Hindi', 'Malayalam', 'Tamil', 'Telugu', 'Kannada','English']
  },

  posterUrl: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true,
    default: 180
  }
});

module.exports = mongoose.model('Movie', movieSchema);
