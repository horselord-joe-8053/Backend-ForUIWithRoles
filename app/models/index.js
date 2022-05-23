const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

// jjw: TODO: how to do mongoose schema and model properly
// jjw: https://stackoverflow.com/a/39871456
// jjw: https://mongoosejs.com/docs/2.7.x/docs/schematypes.html
db.resident = require('./resident.model');
db.staff = require('./staff.model');
db.shiftsInADay = require('./shiftsInADay.model');
db.shiftType = require('./shiftType.model');
db.paymentArrangement = require('./paymentArrangement.model');

db.user = require('./user.model');
db.role = require('./role.model');
db.refreshToken = require('./refreshToken.model');

// db.ROLES = ["user", "admin", "moderator"];
db.ROLES = ['PRIVATEUSER', 'PUBLICUSER', 'STAFF', 'OWNER', 'ADMIN'];

module.exports = db;

/*
  Admin = 'ADMIN',
  Owner = 'OWNER',
  Staff = 'STAFF',
  PrivateUser = 'PRIVATEUSER',
  PublicUser = 'PUBLICUSER',
*/
