const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const app = require('./app');

const DB = process.env.DB_STRING.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose.connect(DB).then(() => console.log('DB connection successful.....'));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App listening on port : ${port}.....`);
});
