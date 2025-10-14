const AppError = require('../utils/appError');

const handleDuplicateFieldDB = (err) => {
  const message = `Email already exist : ${err.keyValue.email}. Please provide another email`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  //unknown errors
  res.status(500).json({
    status: 'error',
    message: 'something went very wrong',
  });
  console.log('ERROR ❌❌', err);
};

exports.globalErrorhandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);

    if (error.code === 11000) error = handleDuplicateFieldDB(error);

    sendErrorProd(error, req, res);
  }
};
