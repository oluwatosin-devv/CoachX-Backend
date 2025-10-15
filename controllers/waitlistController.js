const Waitlist = require('../models/waitlistModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');

exports.JoinWaitlist = catchAsync(async (req, res, next) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) return next(new AppError('Provide name and email'));

  const waitlistEntry = await Waitlist.create({
    fullName,
    email,
  });

  await new Email(waitlistEntry).sendwaitlistmail();

  res.status(201).json({
    status: 'success',
    message: 'Congratulations, waitlist joined',
    data: {
      user: waitlistEntry,
    },
  });
});
