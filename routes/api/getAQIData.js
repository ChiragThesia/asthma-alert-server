require('dotenv').config();
const mongoose = require('mongoose');
const router = require('express').Router();
const User = mongoose.model('User');
const auth = require('../auth');
const axios = require('axios');

router.get('/getAQIdata/:id', auth.required, async (req, res, next) => {
  try {
    const { aqiAlertLevel, location } = await User.findOne(req.param.id);
    const getAQIdata = await axios.get(`https://api.waqi.info/feed/${location}/?token=${process.env.AQIAPI_TOKEN}`);

    res.status(200).json({
      aqiData: getAQIdata.data.data,
      aqiPref: aqiAlertLevel,
      location,
      message: 'AQI Data Provided by AQI.Waqi',
    });
  } catch (next) {
    console.log(error);
  }
});

module.exports = router;
