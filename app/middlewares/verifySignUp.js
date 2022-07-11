const db = require('../models');
const ROLES = db.ROLES;
const User = db.user;

// jjw: TODO, here!!! change role to sing
checkDuplicateUsernameOrEmail = (req, res, next) => {
  // Username
  User.findOne({
    username: req.body.username,
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (user) {
      res.status(400).send({ message: 'Failed! Username is already in use!' });
      return;
    }

    // Email
    User.findOne({
      email: req.body.email,
    }).exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (user) {
        res.status(400).send({ message: 'Failed! Email is already in use!' });
        return;
      }

      next();
    });
  });
};

checkRoleExisted = (req, res, next) => {
  let reqRole = req.body.role;
  if (reqRole && !ROLES.includes(reqRole)) {
    res.status(400).send({
      message: `Failed! Role ${reqRole} associated with client request does not exist!`,
    });
    return;
  }

  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRoleExisted,
};

module.exports = verifySignUp;
