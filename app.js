const express = require('express');
const userRouter = require('./routes/userRoutes');

const app = express();

app.use(express.json());

//routes
app.get('/', (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is currently running....',
  });
});
app.use('/api/v1/users', userRouter);

module.exports = app;
