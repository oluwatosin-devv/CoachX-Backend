const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');

const cors = require('cors');
const userRouter = require('./routes/userRoutes');
const { globalErrorhandler } = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//set security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", 'ws://127.0.0.1:*'], //
        scriptSrc: ["'self'", 'https://js.paystack.co'],
        frameSrc: [
          "'self'",
          'https://checkout.paystack.com', //
        ],
      },
    },
  })
);

//CORS
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://coach-x.vercel.app',
    'https://coach-x.vercel.app/',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
//Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//routes
app.get('/', (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is currently running....',
  });
});
app.use('/api/v1/users', userRouter);

//global error handler
app.use(globalErrorhandler);
module.exports = app;
