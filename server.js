const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const errorhandler = require('errorhandler');

const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 8080;

//server instance
const server = express();

//middleware usages
server.use(cors());
server.use(helmet());
server.use(express.json());
server.use(morgan('dev'));

if (isProduction) {
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose
    .connect('mongodb://localhost/asthma-alert-database', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .then(() => {
      console.log('MongoDB Connected....!!!');
    })
    .catch((error) => {
      console.log(error);
    });
  mongoose.set('debug', true);
}

require('./models/User');
require('./config/passport');
server.use(require('./routes'));

server.get('/', (req, res) => {
  try {
    res.status(200).send('Api is running');
  } catch (err) {
    next(err);
  }
});

server.listen(port, () => {
  console.log(`🚀🌎 Server is running at http://localhost:${port} 🚀`);
});

server.all('*', (req, res) => {
  res.status(404).json({ message: "The URL you are looking for can't be found" });
});
