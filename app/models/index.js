const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.resident = require("./resident.model");

db.user = require("./user.model");
db.role = require("./role.model");
db.refreshToken = require("./refreshToken.model");

// db.ROLES = ["user", "admin", "moderator"];
db.ROLES = ["user", "staff", "owner", "admin"];

module.exports = db;