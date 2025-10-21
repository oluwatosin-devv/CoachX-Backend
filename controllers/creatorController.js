const CreatorProfile = require('../models/creators_model');
const catchAsync = require('../utils/catchAsync');

exports.getAllCreator = catchAsync(async (req, res, next) => {
  const creators = await CreatorProfile.find();

  res.status(200).json({
    status: 'success',
    length: creators.length,
    creators,
  });
});
