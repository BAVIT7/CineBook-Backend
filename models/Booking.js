
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    // Link booking with the logged-in user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },

    movieTitle: {
      type: String,
      required: true,
    },

    cinema: {
      type: String,
      required: true,
    },

    showTime: {
      type: String,
      required: true,
    },

    seats: {
      type: [String],
      required: true,
      validate: [
        {
          validator: (seats) => seats.length > 0,
          message: 'Select at least one seat.',
        },
        {
          validator: (seats) =>
            new Set(seats).size === seats.length,
          message: 'Duplicate seats are not allowed.',
        },
      ],
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

// Prevent duplicate confirmed seats for the same show.
bookingSchema.index(
  {
    movieId: 1,
    cinema: 1,
    showTime: 1,
    seats: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: 'confirmed',
    },
    name: 'unique_confirmed_seat_per_show',
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
