// const AppError = require('../utils/appError');

// const handleDuplicateFieldDB = (err) => {
//   const message = `Email already exist : ${err.keyValue.email}. Please provide another email`;
//   return new AppError(message, 400);
// };

// const sendErrorDev = (err, req, res) => {
//   res.status(err.statusCode).json({
//     status: err.status,
//     error: err,
//     message: err.message,
//     stack: err.stack,
//   });
// };

// const sendErrorProd = (err, req, res) => {
//   if (err.isOperational) {
//     res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message,
//     });
//   }

//   //unknown errors
//   res.status(500).json({
//     status: 'error',
//     message: 'something went very wrong',
//   });
//   console.log('ERROR ❌❌', err);
// };

// exports.globalErrorhandler = (err, req, res, next) => {
//   console.error('ERROR 💥', {
//     message: err.message,
//     name: err.name,
//     code: err.code,
//     stack: err.stack,
//   });

//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   if (process.env.NODE_ENV === 'development') {
//     sendErrorDev(err, req, res);
//   } else if (process.env.NODE_ENV === 'production') {
//     let error = { ...err };

//     error.message = err.message;

//     if (error.code === 11000) error = handleDuplicateFieldDB(error);

//     sendErrorProd(error, req, res);
//   }

//   return sendErrorProd(err, req, res);
// };



const AppError = require("../utils/appError");

const handleDuplicateFieldDB = (err) => {
  const email = err.keyValue?.email || "this email";
  return new AppError(`Email already exists: ${email}. Please use another email.`, 400);
};

const sendErrorDev = (err, req, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  // ✅ trusted / operational error
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // ✅ unknown error (don’t leak details)
  return res.status(500).json({
    status: "error",
    message: "something went very wrong",
  });
};

exports.globalErrorhandler = (err, req, res, next) => {
  // ✅ always log full error (this is what you will read on Vercel)
  console.error("ERROR 💥", {
    url: req.originalUrl,
    method: req.method,
    message: err.message,
    name: err.name,
    code: err.code,
    stack: err.stack,
  });

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // ✅ DEV: show full details in response
  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(err, req, res);
  }

  // ✅ PROD: clone safely
  let error = {
    ...err,
    message: err.message,
    name: err.name,
  };

  // Handle duplicate email
  if (error.code === 11000) error = handleDuplicateFieldDB(error);

  return sendErrorProd(error, req, res);
};
