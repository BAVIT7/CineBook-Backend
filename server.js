
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Movie = require('./models/Movie');
const Booking = require('./models/Booking');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ================= AUTHENTICATION MIDDLEWARE =================

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Please login first to continue.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token. Please login again.',
    });
  }
}

// ================= AUTH APIs =================

// REGISTER API
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: 'Name, email and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Email is already registered.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Email is already registered.',
      });
    }

    return res.status(500).json({
      message: 'Registration failed.',
    });
  }
});

// LOGIN API
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);

    return res.status(500).json({
      message: 'Login failed.',
    });
  }
});

// ================= GENERAL APIs =================

// HOME
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to CineBook API!',
    status: 'Server is running',
  });
});

// GET ALL MOVIES (PUBLIC)
app.get('/api/movies', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (error) {
    console.error('Movie fetch error:', error.message);
    res.status(500).json({
      message: 'Failed to fetch movies.',
    });
  }
});


// SEED / UPDATE CINEBOOK MOVIES
app.post('/api/movies/seed', async (req, res) => {
  try {
    const movies = [
      // ================= ENGLISH - HOLLYWOOD =================
      {
        title: 'Interstellar',
        genre: 'Sci-Fi, Adventure',
        language: 'English',
        posterUrl: 'https://res.cloudinary.com/y6db6lpg/image/upload/v1793513261/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc._V1_FMjpg_UX1000_.jpg',
        price: 200
      },
      {
        title: 'Inception',
        genre: 'Sci-Fi, Thriller',
        language: 'English',
        posterUrl: 'https://res.cloudinary.com/y6db6lpg/image/upload/v1793513322/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw._V1_.jpg',
        price: 250
      },
      {
        title: 'The Batman',
        genre: 'Action, Crime',
        language: 'English',
        posterUrl: 'https://res.cloudinary.com/y6db6lpg/image/upload/v1793513308/pOaKyhMwALpCTg07eQQu0SQCbL9-scaled.jpg',
        price: 350
      },
      {
        title: 'Dune',
        genre: 'Sci-Fi, Adventure',
        language: 'English',
        posterUrl: 'https://res.cloudinary.com/y6db6lpg/image/upload/v1793513336/Dune__282021_film_29.jpg.jpg',
        price: 300
      },

      // ================= HINDI =================
      {
        title: 'Jawan',
        genre: 'Action, Thriller',
        language: 'Hindi',
        posterUrl: 'https://res.cloudinary.com/y6db6lpg/image/upload/v1793513369/Jawan_film_poster.jpg.jpg',
        price: 600
      },
      {
        title: '3 Idiots',
        genre: 'Comedy, Drama',
        language: 'Hindi',
        posterUrl: 'https://res.cloudinary.com/y6db6lpg/image/upload/v1793513391/MV5BNzc4ZWQ3NmYtODE0Ny00YTQ4LTlkZWItNTBkMGQ0MmUwMmJlXkEyXkFqcGc._V1_.jpg',
        price: 300
      },
      {
        title: 'Dangal',
        genre: 'Sports, Drama',
        language: 'Hindi',
        posterUrl: 'https://res.cloudinary.com/y6db6lpg/image/upload/v1793513428/Dangal_Poster.jpg.jpg',
        price: 500
      },

      // ================= MALAYALAM =================
      {
        title: 'Manjummel Boys',
        genre: 'Adventure, Thriller',
        language: 'Malayalam',
        posterUrl: 'https://res.cloudinary.com/y6db6lpg/image/upload/v1793513452/964808-manjummel-boys-0-600-0-900-crop.jpg',
        price: 300
      },
      {
        title: 'Aavesham',
        genre: 'Action, Comedy',
        language: 'Malayalam',
        posterUrl: 'https://res.cloudinary.com/y6db6lpg/image/upload/v1793513482/250px-Aavesham.jpg.jpg',
        price: 250
      },
      {
        title: 'Premalu',
        genre: 'Romance, Comedy',
        language: 'Malayalam',
        posterUrl: 'https://res.cloudinary.com/y6db6lpg/image/upload/v1793513500/MV5BY2JlOTZjNjAtZGFmYy00ZjAyLThmYzEtYWU4OGEzMGQ2ZmY5XkEyXkFqcGc._V1_.jpg',
        price: 200
      },

      // ================= TAMIL =================
      {
        title: 'Leo',
        genre: 'Action, Thriller',
        language: 'Tamil',
        posterUrl: 'https://res.cloudinary.com/y6db6lpg/image/upload/v1793513527/Leo__282023_Indian_film_29.jpg.jpg',
        price: 150
      },
      {
        title: 'Vikram',
        genre: 'Action, Thriller',
        language: 'Tamil',
        posterUrl: 'https://res.cloudinary.com/y6db6lpg/image/upload/v1793513553/MV5BNDEyMWQ0ZDktNTY0MC00YWRkLWFlMjQtMDUxMjRlMDhmMmRlXkEyXkFqcGc._V1_.jpg',
        price: 400
      },

      // ================= TELUGU =================
      {
        title: 'RRR',
        genre: 'Action, Drama',
        language: 'Telugu',
        posterUrl: 'https://res.cloudinary.com/y6db6lpg/image/upload/v1793513572/250px-RRR_Poster.jpg.jpg',
        price: 350
      },
      {
        title: 'Pushpa 2',
        genre: 'Action, Drama',
        language: 'Telugu',
        posterUrl: 'https://res.cloudinary.com/y6db6lpg/image/upload/v1793513598/MV5BZjllNTdiM2QtYjQ0Ni00ZGM1LWFlYmUtNWY0YjMzYWIxOTYxXkEyXkFqcGc._V1_.jpg',
        price: 300
      },

      // ================= KANNADA =================
      {
        title: 'Kantara',
        genre: 'Action, Thriller',
        language: 'Kannada',
        posterUrl: 'https://res.cloudinary.com/y6db6lpg/image/upload/v1793513628/250px-Kantara_poster.jpeg.jpg',
        price: 190
      },
      {
        title: 'KGF Chapter 2',
        genre: 'Action, Drama',
        language: 'Kannada',
        posterUrl: 'https://res.cloudinary.com/y6db6lpg/image/upload/v1793513745/KGF_Chapter_2_Hindi338.jpg',
        price: 250
      }
    ];

    const updatedMovies = await Promise.all(
      movies.map((movie) =>
        Movie.findOneAndUpdate(
          { title: movie.title },
          { $set: movie },
          {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true
          }
        )
      )
    );

    return res.status(200).json({
      message: 'CineBook movies added/updated successfully!',
      count: updatedMovies.length,
      movies: updatedMovies
    });

  } catch (error) {
    console.error('Movie seed error:', error);

    return res.status(500).json({
      message: 'Failed to add/update movies.',
      error: error.message
    });
  }
});

// ================= BOOKING APIs =================

// GET OCCUPIED SEATS (PUBLIC)
// Users can check seat availability without logging in.
app.get('/api/bookings/occupied', async (req, res) => {
  try {
    const { movieId, cinema, showTime } = req.query;

    if (!movieId || !cinema || !showTime) {
      return res.status(400).json({
        message: 'Movie, cinema and showtime are required.',
      });
    }

    if (!mongoose.isValidObjectId(movieId)) {
      return res.status(400).json({
        message: 'Invalid movie ID.',
      });
    }

    const bookings = await Booking.find({
      movieId,
      cinema,
      showTime,
      status: 'confirmed',
    }).select('seats -_id');

    const occupiedSeats = bookings.flatMap(
      (booking) => booking.seats
    );

    return res.status(200).json({
      occupiedSeats: [...new Set(occupiedSeats)],
    });
  } catch (error) {
    console.error('Seat availability error:', error.message);

    return res.status(500).json({
      message: 'Failed to check seat availability.',
    });
  }
});

// GET MY BOOKINGS (LOGIN REQUIRED)
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.user.userId,
    })
      .populate('movieId', 'title posterUrl')
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error.message);

    return res.status(500).json({
      message: 'Failed to fetch bookings.',
    });
  }
});

// CREATE BOOKING (LOGIN REQUIRED)
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const {
      movieId,
      movieTitle,
      cinema,
      showTime,
      seats,
    } = req.body;

if (
  !movieId ||
  !movieTitle ||
  !cinema ||
  !showTime ||
  !Array.isArray(seats) ||
  seats.length === 0
) {
  return res.status(400).json({
    message: 'Please provide all booking details.',
  });
}

    if (!mongoose.isValidObjectId(movieId)) {
      return res.status(400).json({
        message: 'Invalid movie ID.',
      });
    }

    if (
      !seats.every(
        (seat) => typeof seat === 'string' && seat.trim().length > 0
      )
    ) {
      return res.status(400).json({
        message: 'Invalid seat selection.',
      });
    }

    if (new Set(seats).size !== seats.length) {
      return res.status(400).json({
        message: 'Duplicate seats are not allowed.',
      });
    }

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        message: 'Movie not found.',
      });
    }
    // Calculate booking amount using the actual movie price.
const totalAmount = movie.price * seats.length;

    // Check seats already booked for this show.
    const existingBookings = await Booking.find({
      movieId,
      cinema,
      showTime,
      status: 'confirmed',
    });

    const occupiedSeats = existingBookings.flatMap(
      (booking) => booking.seats
    );

    const unavailableSeats = seats.filter(
      (seat) => occupiedSeats.includes(seat)
    );

    if (unavailableSeats.length > 0) {
      return res.status(409).json({
        message: 'Some selected seats are already booked.',
        unavailableSeats,
      });
    }

    // Save booking with the authenticated user's ID.
    const booking = await Booking.create({
      userId: req.user.userId,
      movieId,
      movieTitle,
      cinema,
      showTime,
      seats,
      totalAmount,
    });

    return res.status(201).json({
      message: 'Booking saved successfully!',
      booking,
    });
  } catch (error) {
    console.error('Booking error:', error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: 'One or more selected seats are already booked.',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: 'Failed to save booking.',
    });
  }
});

// ================= START SERVER =================

async function startServer() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing from .env file.');
    }

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing from .env file.');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully!');

    app.listen(PORT, () => {
      console.log(`CineBook API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
}

startServer();
