const config = require("../config/auth.config");
const db = require("../models");
const { user: User, role: Role, refreshToken: RefreshToken } = db;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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

    if (req.body.roles) {
      // jjw: find all the roles in the list of 'req.body.roles'
      Role.find(
        {
          name: { $in: req.body.roles },
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          // jjw: user.roles is a list {}, assigned value by the roles.map(...)
          user.roles = roles.map((role) => role._id);
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.send({ message: "User was registered successfully!" });
          });
        }
      );
    } else {
      // jjw: if 'req.body.roles' is not specified, we default it to 'user' role
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
};

exports.signin = (req, res) => {
  User.findOne({
    username: req.body.username,
  })
    .populate("roles", "-__v")
    .exec(async (err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      let passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }

      // jjw: as long as we sign in with right username/password, we start
      // jjw:   creating a pair of tokens and return them in response
      let token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: config.jwtExpiration,
      });

      // jjw: note that 'refreshToken' returned here is NOT a JWT 'token' object 
      // jjw:   as above, but just an UUID.
      let refreshToken = await RefreshToken.createToken(user);

      let authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        accessToken: token, // jjw: a signed JWT token object
        refreshToken: refreshToken, // jjw: just a UUID
      });
    });
};

// jjw: this gets called for "/api/auth/refreshtoken" requests 
exports.refreshToken = async (req, res) => {
  // jjw; 'requestToken' from {refreshToken:<requestToken>} is just aUUID
  const { refreshToken: requestToken } = req.body;

  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    // jjw: find the 'refreshToken' document in DB by the UUID given in the request,
    // jjw: NOTE: findOne(...): as we have the UUID of the last saved RefreshToken 
    // jjw: Document, we should be fine by using findOne(...) 
    // jjw: NOTE: storing refreshingTokens in DB is NOT usual practice, as usually
    // jjw:   we actually transmit the signed refreshToken payload in a JWT to client 
    // jjw:   and back to server and so on so forth. more secure as we know with the JWT
    // jjw:   if the payload itself has been tempered with, while with the just a naked
    // jjw:   UUID, we can't tell. 
    let refreshToken = await RefreshToken.findOne({ token: requestToken });

    if (!refreshToken) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {
      // jjw: if the refreshToken is also expired, we return error to the client
      // jjw:   asking them to re-signin, upon wich, we will call
      // jjw:   'let refreshToken = await RefreshToken.createToken(user);'
      // jjw:   and create an unexpired refreshToken.
      RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();
      res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
      return;
    }

    // jjw: if refreshToken is not expired, we just took the user._id in the 
    // jjw: refreshToken document we found in the DB, and use it to generate a
    // jjw: new signed JWT token as the new accessToken.
    let newAccessToken = jwt.sign({ id: refreshToken.user._id }, config.secret, {
      expiresIn: config.jwtExpiration,
    });

    // jjw: return 
    // jjw: - the new signed JWT accessToken AND 
    // jjw: - the UUID associated with the current refreshToken
    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
