const logger = require("../utils/logger");

const TokenUtils = require("../utils/tokenUtils");
const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.config");
const {Cookies, TokenExpiration} = require('../config/auth.config');

const db = require("../models");
const User = db.user;
const Role = db.role;

const { TokenExpiredError } = jwt;

// const catchError = (err, res) => {
//   if (err instanceof TokenExpiredError) {
//     // jjw: if the tokent is expired, return error to client immediately
//     // jjw: hoping upon this, the client will send to /refreshToken/ end point
//     return res.status(401).send({ message: "Unauthorized! Token was expired" });
//   }

//   return res.sendStatus(401).send({ message: "Unauthorized! Failed to verify token" });
// }

const verifyAccToken = (req, res, next) => {

  if (!req.cookies){
    logger.logAsStr("authJwt.verifyAccToken", "No cookies found on the http request!");

    // jjw: 401 'unauthorized/unautenticated' v.s. 403 'Forbidden (could be authenticated)'
    // jjw: https://stackoverflow.com/a/6937030
    return res.status(401).send({ message: "Try to verify AccessToken but No cookies found on the http request!" });
  }

  let accessToken = req.cookies[Cookies.AccessToken];
  
  // TODO: for some reason, when try to directly reach a page without logging in, on the browser cookie, accessToken shows as 'undefined'
  if (!accessToken || accessToken === "undefined") {
    logger.logAsJsonStr("authJwt.verifyAccToken", "AccessToken not found from req.cookies:", req.cookies);

    return res.status(401).send({ message: "Try to verify AccessToken but no AccessToken or 'undefined' AccessToken is provided in the cookies!" });
  }

  logger.logAsJsonStr("authJwt.verifyAccToken", "AccessToken found, before TokenUtils.verifyToken(), encoded AccessToken:", accessToken);

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

  logger.logAsJsonStr("authJwt.verifyAccToken", "after TokenUtils.verifyToken(), decoded AccessToken", decodedAccessToken);

  // detect undefined: https://stackoverflow.com/a/2985773
  if (decodedAccessToken) {

    logger.logAsStr("authJwt.verifyAccToken", "decodedAccessToken is NOT Undefined, proceed to next step...", "");

    // jjw: set a custom property on the req, for convenience of later middleware and handlers
    req.userId = decodedAccessToken.userId;

    // jjw: allow pass this middleware to handle the request 
    next();
    return;
  } else {
    logger.logAsStr("authJwt.verifyAccToken", "TokenUtils.verifyAccessToken encountered problem (e.g. expired token), causing decodedAccessToken to be Undefined, return", "");

    return; 
  }
  // TokenUtils.verifyAccessToken(accessToken, (err, decodedAccessToken) => {
  //   if (err) {
  //     Logger.logAsJsonStr("-- authJwt.verifyAccessToken", "Caught an error: ", err);

  //     // jjw: https://github.com/auth0/node-jsonwebtoken/issues/609
  //     // jjw: https://github.com/auth0/node-jsonwebtoken/blob/eefb9d9c6eec54718fa6e41306bda84788df7bec/verify.js#L199-L211
  //     // jjw: https://github.com/auth0/node-jsonwebtoken/blob/eefb9d9c6eec54718fa6e41306bda84788df7bec/lib/TokenExpiredError.js
  //     if (err instanceof TokenExpiredError) {
  //       // jjw: if the tokent is expired, return error to client immediately
  //       // jjw: hoping upon this, the client will send to /refreshToken/ end point
  //       return res.status(401).send({ message: "Unauthorized! AccessToken expired" });
  //     }
    
  //     return res.sendStatus(401).send({ message: "Unauthorized! Failed to verify AccessToken for reasons other than expired token" });
  //   }
  //   Logger.logAsJsonStr("-- authJwt.verifyAccessToken", "AccessToken not expired, decoded to:", decodedAccessToken);

  //   // jjw: set a custom property on the req, for convenience of later middleware and handlers
  //   req.userId = decodedAccessToken.userId;

  //   next();
  // });


};

// const verifyToken = (req, res, next) => {
//   let token = req.headers["x-access-token"];

//   if (!token) {
//     return res.status(403).send({ message: "No token provided!" });
//   }

//   jwt.verify(token, config.accessTokenSecret, (err, decoded) => {
//     if (err) {
//       return catchError(err, res);
//     }
//     req.userId = decoded.id;
//     next();
//   });
// };

const isStaff = (req, res, next) => {
  // jjw: we have a 'req.userId' only because we set a custom property on the req
  // jjw:   in the previously call middleware verifyAccToken, a bit of a 'Cheating'
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.find(
      {
        _id: { $in: user.roles }
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "staff") {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Staff Role!" });
        return;
      }
    );
  });
};

const isOwner = (req, res, next) => {
  // jjw: we have a 'req.userId' only because we set a custom property on the req
  // jjw:   in the previously call middleware verifyAccToken, a bit of a 'Cheating'

  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.find(
      {
        _id: { $in: user.roles }
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "owner") {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Owner Role!" });
        return;
      }
    );
  });
};

const isAdmin = (req, res, next) => {
  // jjw: we have a 'req.userId' only because we set a custom property on the req
  // jjw:   in the previously call middleware verifyAccToken, a bit of a 'Cheating'
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.find(
      {
        _id: { $in: user.roles }
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "admin") {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Admin Role!" });
        return;
      }
    );
  });
};

const authJwt = {
  verifyAccToken,
  isStaff,
  isOwner,
  isAdmin
};
module.exports = authJwt;
