require('dotenv').config();
const mongoose = require('mongoose');
const router = require('express').Router();
const User = mongoose.model('User');
const auth = require('../auth');
const axios = require('axios');

router.get('/getUserAQI', auth.required, async (req, res, next) => {
  try {
    const { aqiAlertLevel, location } = await User.findById(req.payload.id);
    console.log('userData', { aqiAlertLevel, location });
    const getAQIdata = await axios.get(`https://api.waqi.info/feed/${location}/?token=${process.env.AQIAPI_TOKEN}`);
    console.log('AQI DATA', getAQIdata.data.data);

    res
      .status(200)
      .json({
        aqiData: getAQIdata.data.data,
        message: 'Here is the AQI data based on the location you have provided!',
      });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
