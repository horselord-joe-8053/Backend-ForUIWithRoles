const logger = require('../utils/logger');

const TokenUtils = require('../utils/tokenUtils');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');
const { Cookies, TokenExpiration } = require('../config/auth.config');

const db = require('../models');
const User = db.user;
const Role = db.role;

const { TokenExpiredError } = jwt;

const accessTokenMissingMsg = 'Unauthorized! AccessToken is missing';
const accessRefreshTokenBothMissingMsg =
  'Unauthorized! AccessToken and RefreshToken are both missing';

/*---- functions to verify tokens ----*/  
const verifyAccToken = (req, res, next) => {
  if (!req.cookies) {
    logger.logAsStr('authJwt.verifyAccToken', 'No cookies found on the http request!');

    // jjw: 401 'unauthorized/unautenticated' v.s. 403 'Forbidden (could be authenticated)'
    // jjw: https://stackoverflow.com/a/6937030
    return res
      .status(401)
      .send({ message: 'Try to verify AccessToken but No cookies found on the http request!' });
  }

  logger.logAsJsonStr('authJwt.verifyAccToken', 'check req.cookies:', req.cookies);

  let accessToken = req.cookies[Cookies.AccessToken];
  let refreshToken = req.cookies[Cookies.RefreshToken];

  // JJW: TODO NOW!!!: for some reason, when try to directly reach a page without logging in, on the browser cookie, accessToken shows as 'undefined'
  // JJW: TODO NOW!!!: imagine when we had a short server down time betwen user interactions, we want
  // JJW:   it to be seamless to user as if nothing happend, so if access token is now undefined but
  // JJW:   refreshToken is there, we should still go through 'refereshToken()', no?
  if (!accessToken || accessToken == 'undefined') {
    logger.logAsJsonStr('authJwt.verifyAccToken', 'AccessToken NOT found from req.cookies', '');

    if (refreshToken && refreshToken != 'undefined') {
      logger.logAsJsonStr(
        'authJwt.verifyAccToken',
        'But RefreshToken is found from req.cookies, refreshToken:',
        refreshToken
      );
      return res.status(401).send({ message: accessTokenMissingMsg });
    } else {
      return res.status(401).send({ message: accessRefreshTokenBothMissingMsg });
    }
  }

  logger.logAsJsonStr(
    'authJwt.verifyAccToken',
    'AccessToken is found in req.cookies, before TokenUtils.verifyToken(), encoded AccessToken:',
    accessToken
  );

  /* TODO: HERE !!!
  in authJwt.verifyToken(), 'AccessToken found, before decoding:':
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MjI0NThhYmM0MGVlNzRhMmRlN2VlMTQiLCJpYXQiOjE2NDg5MTc3NTEsImV4cCI6MTY0ODkxODA1MX0.4ocvrxGqhKWjYOXgh7wZfy2M7w870JulCO3PgcDISjk"
  in authJwt.verifyToken(), 'AccessToken not expired, decoded to:':
  {
          "userId": "622458abc40ee74a2de7ee14",
          "iat": 1648917751,
          "exp": 1648918051
  }  
  */

  let decodedAccessToken = TokenUtils.verifyAccessToken(res, accessToken);

  logger.logAsJsonStr(
    'authJwt.verifyAccToken',
    'after TokenUtils.verifyToken(), decoded AccessToken',
    decodedAccessToken
  );

  // detect undefined: https://stackoverflow.com/a/2985773
  if (decodedAccessToken) {
    logger.logAsStr(
      'authJwt.verifyAccToken',
      'decodedAccessToken is NOT Undefined, proceed to next step...',
      ''
    );

    // jjw: set a custom property on the req, for convenience of later middleware and handlers
    req.userId = decodedAccessToken.userId;

    // jjw: allow pass this middleware to handle the request
    next();
    return;
  } else {
    logger.logAsStr(
      'authJwt.verifyAccToken',
      'TokenUtils.verifyAccessToken encountered problem (e.g. expired token), causing decodedAccessToken to be Undefined, return',
      ''
    );

    return;
  }
}

/*---- functions to verify roles ----*/  
const verifyIsAtLeastStaff = (req, res, next) => {
  return verifyIsAtLeast(isAtLeastStaff, 'staff', req, res, next)
}

const verifyIsAtLeastOwner = (req, res, next) => {
  return verifyIsAtLeast(isAtLeastOwner, 'owner', req, res, next)
}

const verifyIsAtLeastAdmin = (req, res, next) => {
  return verifyIsAtLeast(isAtLeastAdmin, 'admin', req, res, next)
}

const verifyIsAtLeast = async (isAtLeastFunc, atLeastRole, req, res, next) => {
  logger.logAsStr('authJwt.verifyIsAtLeast', 'start... atLeastRole:', atLeastRole);
  logger.logAsJsonStr('authJwt.verifyIsAtLeast', 'start... isAtLeastFunc:', isAtLeastFunc);

  try {
    let isAtLeastResult = await isAtLeastFunc(req); 
    // jjw: NOTE: this 'await' is needed hence also need to make this function async

    logger.logAsStr('authJwt.verifyIsAtLeast', 'isAtLeastResult:', isAtLeastResult);

    if (isAtLeastResult == true) {
      logger.logAsStr('authJwt.verifyIsAtLeast', 'success! atLeastRole', atLeastRole);

      next();
    } else {
      logger.logAsStr('authJwt.verifyIsAtLeast', 'failure! atLeastRole', atLeastRole);

      res.status(403).send({ message: 'Require At Least ' + atLeastRole + ' Role!' });
    }
  } catch (err) {
    res.status(500).send({ message: err });
  }
}

// isAtLeast* functions
const isAtLeastStaff = async (req) => {
  let result = await isStaff(req) || await isOwner(req) || await isAdmin(req);
  // jjw: need 'await' here to make sure we get each eval result in order for '||' work properly
  logger.logAsStr('authJwt.isAtLeastStaff', 'result:', result);
  return result;
}

const isAtLeastOwner = async (req) => {
  let result = await isOwner(req) || await isAdmin(req);
  logger.logAsStr('authJwt.isAtLeastOwner', 'result:', result);
  return result;
}

const isAtLeastAdmin = async (req) => {
  let result = isAdmin(req);
  logger.logAsStr('authJwt.isAtLeastAdmin', 'result:', result);
  return result;
}

// is* functions
const isUser = (req) => {
  return verifyRole(req, 'user');
}

const isStaff = (req) => {
  return verifyRole(req, 'staff');
}

const isOwner = (req) => {
  return verifyRole(req, 'owner');
}

const isAdmin = (req) => {
  return verifyRole(req, 'admin');
}

const verifyRole = async (req, roleToVerify) => {
  // jjw: we have a 'req.userId' only because we set a custom property on the req
  // jjw:   in the previously call middleware verifyAccToken, a bit of a 'Cheating'
  logger.logAsStr('authJwt.verifyRole', 'roleToVerify', roleToVerify);

  // jjw: TODO, right here!!! async calls to the database!!! need to 
  // jjw: - make all levels as async functions
  // jjw: - top level using await for lower levels and return to do next() or put err on response 

  // 1. find user
  let user = undefined;
  try {
    logger.logAsStr('authJwt.verifyRole', 'try to find user by req.userId', req.userId);

    // user = await User.findById(req.userId);
    user = await User.findById(req.userId).exec();
    // user = await User.findOne({ _id: req.userId });
    // user = await User.findOne({ _id: req.userId }).exec();

  } catch (err) {
    // jjw: NOTE: 
    // jjw: err itself is not a standard JSON object 
    // jjw: we can only JSON.stringify 
    // jjw: - err.stack
    // jjw: - err.message
    // logger.logAsJsonStr('authJwt.verifyRole', 'err.stack', err.stack);
    logger.logAsJsonStr('authJwt.verifyRole', 'finding user, err.message', err.message);

    // throw 'Try to find user with userId: ' + req.userId + '. Error: ' + JSON.stringify(err.stack);
    throw 'Try to find user with userId: ' + req.userId + '. Unexpected Server Side Error: ' + JSON.stringify(err.message);
  }

  // 2. find the role associated with the user
  let roleId = user && user.roles;

  let role  = undefined;
  try {
    logger.logAsStr('authJwt.verifyRole', 'try to find roleId by user.roles', roleId);

    role = await Role.findById(roleId).exec();
  } catch (err) {
    logger.logAsJsonStr('authJwt.verifyRole', 'finding role, err.message', err.message);
    
    throw 'Try to find role with roleId: ' + roleId + ' for userId:' + userId + '. Unexpected Server Side Error: ' + JSON.stringify(err.message);
  }

  logger.logAsStr('authJwt.verifyRole', 'found role with role.name:', role.name);

  let result = role && (role.name === roleToVerify);

  logger.logAsStr('authJwt.verifyRole', 'result', result);

  return result;
};

const authJwt = {
  verifyAccToken,
  verifyIsAtLeastStaff,
  verifyIsAtLeastOwner,
  verifyIsAtLeastAdmin
};
module.exports = authJwt;
