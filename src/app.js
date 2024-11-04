const express = require('express');
const cors = require('cors');
const { config } = require('dotenv');
const cookieParser = require('cookie-parser');

const app = express();

const router = require('./routes/index');
const { initializeTables } = require('./db/seeders/seedingDb');
const globalErrorHandle = require('./controllers/errorController');
const AppError = require('./utils/appError');

config();

// ! USE CORS FOR SAFETY
app.use(
  cors({
    credentials: true,
    origin: process.env.ORIGIN,
  })
);

// ! PARSING COOKIE
app.use(cookieParser());

// ! Middleware to parse JSON bodies
app.use(express.json()); // Tambahkan ini untuk mengurai body JSON

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
