const express = require('express');
const cors = require('cors');
const { config } = require('dotenv');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Users = require('./models/users');

const app = express();

const router = require('./routes/index');
const { initializeTables } = require('./db/seeders/seedingDb');
const globalErrorHandle = require('./controllers/errorController');
const AppError = require('./utils/appError');
const { rateLimit } = require('express-rate-limit');
const { xss } = require('express-xss-sanitizer');

config();

// ! USE CORS FOR SAFETY
app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:5173'],
  })
);

//! Limiter request
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, wait again an a hour !',
});
app.use('/api', limiter);

// ! Middleware to parse JSON bodies
app.use(express.json({ limit: '10kb' }));

// ! SANITIZES USER INPUT DATA
app.use(xss());

// ! PARSING COOKIE
app.use(cookieParser());

// Initialize Passport.js
app.use(passport.initialize());

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/v1/user/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // Handle user authentication and creation in DB
      const user = await Users.findOrCreateGoogleUser(profile);
      done(null, user);
    }
  )
);

// ! ROUTING OR ENDPOINT
app.use(router);

// ! NO ENDPOINT ERROR
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});

// ! ERROR HANDLER
app.use(globalErrorHandle);

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    await initializeTables();

    app.listen(port, () => {
      console.log(`server app listening on port http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize database tables:', error);
    process.exit(1);
  }
}

startServer();
