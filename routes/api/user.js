const mongoose = require('mongoose');
const router = require('express').Router();
const passport = require('passport');
const User = mongoose.model('User');
const auth = require('../auth');

router.get('/getUser/:id', auth.required, (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        return res.sendStatus(401);
      }

      return res.json({ user: user.userData() });
    })
    .catch(next);
});

router.put('/updateUser/:id', auth.required, (req, res, next) => {
  console.log('req.body', req.body);
  User.findByIdAndUpdate(req.params.id, req.body, { upsert: true, new: true })
    .then((user) => {
      if (!user) {
        res.sendStatus(401);
      }
      res.status(200).json({ user: user.updatedUser() });
    })
    .catch(next);
});

//test

router.post('/login', (req, res, next) => {
  if (!req.body.user.email) {
    return res.status(422).json({ errors: { email: "can't be blank" } });
  }

  if (!req.body.user.password) {
    return res.status(422).json({ errors: { password: "can't be blank" } });
  }

  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      res.status(422).json({ errors: { 'email or password': 'is invasdfsflid' } });
    }

    if (user) {
      user.token = user.generateJWT();
      return res.status(200).json({ user: user.toAuthJSON() });
    } else {
      return res.status(422).json({ message: 'No user found' });
    }
  })(req, res, next);
});

router.post('/signup', (req, res, next) => {
  const user = new User();
  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.setPassword(req.body.user.password);
  user.aqiAlertLevel = req.body.user.aqiAlertLevel;
  user.location = req.body.user.location;
  user
    .save()
    .then(() => {
      return res.json({ user: user.toAuthJSON() });
    })
    .catch((error) => {
      console.log(error);
      next();
    });
});

module.exports = router;
