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

router.put('/updateUser', auth.required, (req, res, next) => {
  User.findOneAndUpdate(req.body.id, req.body, { upsert: true, new: true })
    .then((user) => {
      if (!user) {
        res.sendStatus(401);
      }
      res.json({ user: user.updatedUser() });
    })
    .catch(next);
});

router.post('/login', (req, res, next) => {
  console.log(req.body);
  if (!req.body.user.email) {
    return res.status(422).json({ errors: { email: "can't be blank" }, error });
  }

  if (!req.body.user.password) {
    return res.status(422).json({ errors: { password: "can't be blank" }, error });
  }

  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      console.log(err);
      return next(err);
    }

    if (user) {
      user.token = user.generateJWT();
      return res.json({ user: user.toAuthJSON() });
    } else {
      return res.status(422).json(info);
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
