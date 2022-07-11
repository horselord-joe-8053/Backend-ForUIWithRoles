const TokenUtils = require('../utils/tokenUtils');
const logger = require('../utils/logger');

const config = require('../config/auth.config');
const db = require('../models');
const { user: User, role: Role, refreshToken: RefreshToken } = db;

const jwt = require('jsonwebtoken');

const { v4 } = require('uuid');
const uuidv4 = v4;

const authConfig = require('../config/auth.config');
const ObjectId = require('mongodb').ObjectID;

const { Cookies, TokenExpiration } = require('../config/auth.config');

// import {v4 as uuidv4} from 'uuid';
// import authConfig from '../config/auth.config';
// import * as TokenUtils from '../utils/token-utils';

// jjw: TODO:
// jjw: https://www.youtube.com/watch?v=uAKzFhE3rxU
/* IMPORTANT: Please use argon for hashing and verifying refresh 
tokens (https://www.npmjs.com/package/argon2). Bcrypt is only good 
for short passwords (less than 74 bytes). Since our refresh token 
is a JWT, it will be longer than 74 bytes, so our bcrypt compare 
function might return true when it should not!*/
const bcrypt = require('bcryptjs');

exports.signup = (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    let roleFromReq = req.body.role;
    if (roleFromReq) {
      Role.find(
        {
          name: { $eq: roleFromReq },
        },
        (err, role) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.role = role._id;
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.send({ message: 'User was registered successfully!' });
          });
        }
      );
    } else {
      // jjw: if 'req.body.role' is not specified, we default it to 'publicuser' role
      Role.findOne({ name: 'publicuser' }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.role = [role._id];
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: 'User was registered successfully!' });
        });
      });
    }
  });
};

exports.signinNew = (req, res) => {
  User.findOne({
    username: req.body.username,
  })
    .populate('role', '-__v')
    .exec(async (err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: 'User Not found.' });
      }

      logger.logAsJsonStr(
        'auth.controller.signin | before updateOne | before TokenUtils.refreshTokens',
        'user after populate',
        user
      );

      let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: 'Invalid Password!',
        });
      }

      // // jjw: as long as we sign in with right username/password, we start
      // // jjw:   creating a pair of tokens and return them in response
      // let token = jwt.sign({ id: user.id }, config.accessTokenSecret, {
      //   expiresIn: config.jwtExpiration,
      // });

      // // jjw: note that 'refreshToken' returned here is NOT a JWT 'token' object
      // // jjw:   as above, but just an UUID.
      // let refreshToken = await RefreshToken.createToken(user);

      /// update start
      let newLoginSessionId = uuidv4();
      if (!user.loginSessions) {
        // jjw: initialize user.loginSessions to empty
        user.loginSessions = {};
      }
      // jjw: initial login session version to be 1 (not 0 as we want
      // jjw:   (!user.loginSessions[newLoginSessionId]) test only for 'undefined')
      user.loginSessions[newLoginSessionId] = 1;
      // jjw: https://www.geeksforgeeks.org/mongoose-updateone-function/?ref=lbp
      User.updateOne({ _id: ObjectId(user._id) }, user).exec(async (err, updateStatusResult) => {
        logger.logAsJsonStr('auth.controller.signin | in updateOne, start...', 'user', user);
        logger.logAsJsonStr(
          'auth.controller.signin | in updateOne, before TokenUtils.refreshTokens',
          'updateStatusResult',
          updateStatusResult
        );

        // jjw: itemUpdated will be, if successful,
        // jjw:   'itemUpdate: {"n":1,"nModified":1,"ok":1}'
        // jjw:   https://github.com/Automattic/monk/issues/149#issuecomment-232569704
        // jjw:     - n is the number of matched documents
        // jjw:     - nModified is the number of modified documents
        if (err) {
          res.status(500).send({ message: 'During sign in, updating user, error:' + err });
          return;
        }

        // if (!updateStatusResult) {
        //   return res.status(404).send({ message:
        //     "updateOne for user did not return any updated user" });
        // }

        // res.status(200).send(userUpdated);

        /// create token
        const { accessToken, refreshToken } = TokenUtils.buildTokens(user, newLoginSessionId);

        /// set token on cookie with the response
        TokenUtils.setTokens(res, accessToken, refreshToken);
        logger.logAsJsonStr(
          'auth.controller.signin | in updateOne, after TokenUtils.setTokens',
          '---res.cookies',
          res.cookies
        );

        let userRole = user.role && user.role.name.toUpperCase();

        logger.logAsJsonStr('auth.controller.signin | in updateOne', 'userRole', userRole);

        // jjw: HERE TODO!!!  on log in need to set the tokens based on user
        // jjw: HERE TODO!!! instead of sending tokens here, set them on the cookies of the browser,
        // jjw:   like here: https://github.com/flolu/auth/blob/master/api/index.ts
        res.status(200).send({
          id: user._id,
          username: user.username,
          email: user.email,
          role: userRole,
          // accessToken: token, // jjw: a signed JWT token object
          // refreshToken: refreshToken, // jjw: just a UUID
        });
      });
    });
};

// jjw: this gets called for "/api/auth/refreshtoken" requests
exports.refreshToken = async (req, res) => {
  // NOTE: need to use await as we are keeping the entire 'refershToken' process atomic
  //  for that there could be multiple requests that requires 'refreshToken' process,
  //  fired on the client side at the same time. This needs to includes all async calls
  //  that 'refreshToken' process calls.

  // jjw: TODO: NOW!!!
  // jjw: best practice - do not use cookie but browser sessionStore???
  // jjw:   https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/#silent-refresh
  // jjw:   https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.md#json-web-token-cheat-sheet-for-java

  // jjw: TODO: NOW!!!
  // jjw: best practice - mobile device, 'refreshtoken lives forever' so need a way to 'revoke' the access from that (device + user) combo
  // jjw: https://stackoverflow.com/a/26834685/18362708

  // jjw: NOTE A: we implement Refresh Token Rotation:
  // jjw:    https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation
  // jjw:    => when AccessToken expires, but RefreshToken has not expired, we use RefreshToken
  // jjw:       to create a new AccessToken (which is the basic procedure), but in addition, we
  // jjw:       create a RefreshToken too.
  // jjw:   If there is doubt that effectively this makes RefreshToken's lifespan no more than
  // jjw:     the much shorter lived AccessToken, it is a seemly valid but incorrect doubt.
  // jjw:   Simply put, during the lifespan of the RefreshToken, the user retain a 'ticket' to
  // jjw:     enter in to this dual-token-recreation process; while when lifespan of the
  // jjw:     RefreshToken lapsed, user can't enter into this dual-token-recreation process
  // jjw:     (until re-login where both AccessToken and RefreshTokenwill be created
  // jjw:     from scratch (not from any RefreshToken))

  // jjw: NOTE B: we will also implement 'Automatic reuse detection'
  // jjw:   https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation#automatic-reuse-detection
  // jjw:   => for each chain of [AccessToken, RefreshToken] that rooted from a log-in, a version attributed will
  // jjw:     be stored in the DB;
  // jjw:     Everytime refreshTokens (the dual-token-recreation aforementioned) is triggered, we first check if the
  // jjw:     RefreshToken passed by the client carries the same version number,
  // jjw:     -- if so, we naturally increment this version number in the DB (as if adding to a chain)
  // jjw:     -- if not, we have a problem, a malicious user must have stolen the RefreshToken and
  // jjw:       caused the version to increase once or multiple times to caused this 'surprise' to
  // jjw:       legit client request

  // jjw: TODO: what will request of '/logout-all' trigger ????
  // jjw:    const result = await coll.findOneAndUpdate({id: userId}, {$inc: {tokenVersion: 1}})

  logger.logAsStr('auth.controller.refreshToken', 'start', '');

  try {
    if (!req.cookies) {
      logger.logAsStr('auth.controller.refreshToken', 'No cookies found on the http request!', '');

      throw 'Try to verify RefreshToken but No cookies found on the http request!';
    }

    logger.logAsStr(
      'auth.controller.refreshToken',
      'cookies successfully found on the http request!',
      ''
    );

    let refreshToken = req.cookies[Cookies.RefreshToken];

    if (!refreshToken) {
      logger.logAsJsonStr(
        'auth.controller.refreshToken',
        'RereshToken not found from req.cookies:',
        req.cookies
      );

      throw 'Try to verify RefreshToken but No token provided on the cookies!';
    }

    logger.logAsJsonStr(
      'auth.controller.refreshToken',
      'RereshToken found, before TokenUtils.verifyToken(), encoded RefreshToken:',
      refreshToken
    );

    // jjw: verify and decode the refreshToken from the Cookie of the request
    // jjw: remember that RefreshToken is {userId: string, version: number, exp: number}

    const decodedCurrRefreshToken = TokenUtils.verifyRefreshToken(res, refreshToken);
    logger.logAsJsonStr(
      'auth.controller.refreshToken',
      'after TokenUtils.verifyToken(), decodedCurrRefreshToken',
      decodedCurrRefreshToken
    );

    // const decodedCurrRefreshToken = TokenUtils.verifyRefreshToken(refreshToken)
    // logger.logAsJsonStr("auth.controller.refreshToken", "currRefreshToken", decodedCurrRefreshToken);

    const currUserId = decodedCurrRefreshToken.userId;
    const user = await User.findOne({ _id: currUserId });
    if (!user) throw 'User not found for userId: {' + currUserId + '}';

    logger.logAsJsonStr('auth.controller.refreshToken', 'user found:', user);

    // jjw: refreshTokens(...) will check if the version of the current refreshToken
    // jjw:   matches with the version associated with that user stored in the DB
    let currRefreshTokenLoginSessionId = decodedCurrRefreshToken.loginSessionId;
    logger.logAsStr(
      'auth.controller.refreshToken',
      'currRefreshTokenLoginSessionId',
      currRefreshTokenLoginSessionId
    );

    let userLoginSessionVersionFromDB = user.loginSessions[currRefreshTokenLoginSessionId];
    logger.logAsStr(
      'auth.controller.refreshToken',
      'userLoginSessionVersionFromDB',
      userLoginSessionVersionFromDB
    );

    if (!userLoginSessionVersionFromDB) {
      // if the loginSession indicated by the current refresh token passed by the client is no longer
      // assoicated with the user, it means it had been removed, i.e. that login session has been compromised.
      // hence we throw an error.
      throw authConfig.loginSessionNotFoundInDBErrorMsg;
    }

    if (decodedCurrRefreshToken.loginSessionVersion !== userLoginSessionVersionFromDB) {
      logger.logAsStr(
        'auth.controller.refreshToken',
        'decodedCurrRefreshToken.loginSessionVersion',
        decodedCurrRefreshToken.loginSessionVersion
      );
      logger.logAsStr('auth.controller.refreshToken', 'version not matching!!!', '');

      // jjw: Need to do more
      // TODO: here!! remove the entire loginSession entry from the user
      // op1: throw exception and catch at outter level
      // op2: pass in User model and do it here.
      // TODO: below shouldn't be relevant anymore, we need to return somehow???

      logger.logAsJsonStr(
        'auth.controller.refreshToken',
        'BEFORE delete sessionId: (' + currRefreshTokenLoginSessionId + '), user',
        user
      );

      // jjw: https://dmitripavlutin.com/remove-object-property-javascript/
      // jjw: remove the entire 'chain'/entry for that login Session from the user
      delete user.loginSessions[currRefreshTokenLoginSessionId];

      logger.logAsJsonStr(
        'auth.controller.refreshToken',
        'AFTER delete sessionId: (' + currRefreshTokenLoginSessionId + '), user',
        user
      );

      // NOTE: need to use await as we are keeping the entire 'refershToken' process atomic
      //  for that there could be multiple requests that requires 'refreshToken' process,
      //  fired on the client side at the same time. This needs to includes all async calls
      //  that 'refreshToken' process calls.
      await updateUserDB(user);

      throw authConfig.versionMismatchErrorMsg;
    }

    // Carrying out a normal refresh operation: generating new refresh and access tokens

    let updatedUserLoginSessionVersion = userLoginSessionVersionFromDB + 1; // increment the loginSession Version
    logger.logAsStr(
      'auth.controller.refreshToken | after increment |  updatedUserLoginSessionVersion',
      'updatedUserLoginSessionVersion',
      updatedUserLoginSessionVersion
    );

    user.loginSessions[currRefreshTokenLoginSessionId] = updatedUserLoginSessionVersion;

    // NOTE: need to use await as we are keeping the entire 'refershToken' process atomic
    //  for that there could be multiple requests that requires 'refreshToken' process,
    //  fired on the client side at the same time. This needs to includes all async calls
    //  that 'refreshToken' process calls.
    await updateUserDB(user);

    logger.logAsStr(
      'auth.controller.refreshToken | BEFORE TokenUtils.generateRefreshedTokens',
      'currRefreshTokenLoginSessionId',
      currRefreshTokenLoginSessionId
    );

    const { newAccessToken, newRefreshToken } = TokenUtils.generateRefreshedTokens(
      currUserId,
      currRefreshTokenLoginSessionId,
      updatedUserLoginSessionVersion
    );

    logger.logAsJsonStr(
      'auth.controller.refreshToken | AFTER TokenUtils.generateRefreshedTokens',
      'newAccessToken',
      newAccessToken
    );
    logger.logAsJsonStr(
      'auth.controller.refreshToken | AFTER TokenUtils.generateRefreshedTokens',
      'newRefreshToken',
      newRefreshToken
    );

    // jjw: NOTE refreshToken from above may be undefined
    // jjw: setTokens() below only update the refreshToken in the cookie if it is defined
    TokenUtils.setTokens(res, newAccessToken, newRefreshToken);

    // return res.status(200).json({
    //   accessToken: newAccessToken,
    //   refreshToken: refreshToken.token,
    // });

    res
      .status(200)
      .send(
        'Successfully Refreshed Tokens - a new AccessToken and a new RefreshToken have been set on the Cookie'
      );
  } catch (error) {
    logger.logAsJsonStr('auth.controller.refreshToken', 'error', error);
    // if (error === authConfig.versionMismatchErrorMsg) {
    //   // jjw: this is a form of unauthorized error
    //   res.status(401).send({ message: error });
    // } else if (error === authConfig.loginSessionNotFoundInDBErrorMsg) {
    //   // jjw: this is a form of unauthorized error
    //   res.status(401).send({ message: error });
    // } else {
    //   // TokenUtils.clearTokens(res); //TODO: reenable !!!!

    //   // jjw: TODO: need to handle this on the client side by force a log out, given that we delete the tokens
    //   res.status(500).send({ message: error });
    // }

    TokenUtils.clearTokens(res); //TODO: reenable !!!!
    // jjw: no matter what type of error, it should be a 'authorization failure' hence 401. TODO: true ???
    res.status(401).send({ message: error });
  }

  res.end();
};

updateUserDB = async (user) => {
  logger.logAsStr('auth.controller.updateUserDB start:', 'user.username', user.username);

  try {
    // NOTE: need to use await as we are keeping the entire 'refershToken' process atomic
    //  for that there could be multiple requests that requires 'refreshToken' process,
    //  fired on the client side at the same time. updateUserDB is part of this process
    const updateStatusResult = await User.updateOne({ _id: ObjectId(user._id) }, user);
    logger.logAsJsonStr(
      'auth.controller.updateUserDB end',
      'updateStatusResult',
      updateStatusResult,
      'info'
    );
  } catch (err) {
    throw 'Error occurred during updating user in DB:' + JSON.stringify(err);
  }
};
