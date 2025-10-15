const Waitlist = require('../models/waitlistModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.JoinWaitlist = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;
  if (!name || !email) return next(new AppError('Provide name and email'));

  const waitlistEntry = await Waitlist.create({
    name,
    email,
  });

  res.status(201).json({
    status: 'success',
    message: 'Congratulations, waitlist joined',
    data: {
      user: waitlistEntry,
    },
  });
});
