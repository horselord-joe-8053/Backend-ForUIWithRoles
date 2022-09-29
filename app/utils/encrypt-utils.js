const fs = require('fs');
const path = require('path');

const Logger = require('./logger');

const bcrypt = require('bcryptjs');

exports.encrypt = (str) => {
  return bcrypt.hashSync(str, 8);
};

exports.compareToEncrypted = (unencrypted, encrypted) => {
  return bcrypt.compareSync(unencrypted, encrypted);
};
