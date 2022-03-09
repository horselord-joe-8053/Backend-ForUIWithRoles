const mongoose = require("mongoose");
const config = require("../config/auth.config");
const { v4: uuidv4 } = require('uuid');

const RefreshTokenSchema = new mongoose.Schema({
  token: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  expiryDate: Date,
});

// jjw: RefreshToken.creatToken(...) gets called on signin request
RefreshTokenSchema.statics.createToken = async function (user) {
  let expiredAt = new Date();

  expiredAt.setSeconds(
    // jjw: the expiration timestamp in seconds
    // jwtExpiration: 60,          // 1 minute
    // jwtRefreshExpiration: 120,  // 2 minutes
    expiredAt.getSeconds() + config.jwtRefreshExpiration
  );

  // jjw: _token and _object in a statics.<method> are actual field 
  // jjw:     and itself of this document instance

  // jjw: get a UUID
  let _token = uuidv4();

  // jjw: create this document instance by instantiating this model
  let _object = new this({
    token: _token,
    user: user._id,
    expiryDate: expiredAt.getTime(),
  });

  console.log(_object);

  // jjw: save this document instance of RefreshToken in the DB
  let refreshToken = await _object.save();

  return refreshToken.token;
};

RefreshTokenSchema.statics.verifyExpiration = (token) => {
  // jjw: check if the token is not expired yet
  return token.expiryDate.getTime() < new Date().getTime();
}

const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);

module.exports = RefreshToken;
