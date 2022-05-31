const { verifySignUp } = require('../middlewares');
const controller = require('../controllers/auth.controller');

// jjw: we are passsing an express 'app' object to here
// jjw:   which will call .use(...) .post(...) to add more
// jjw:   routes
module.exports = function (app) {
  app.use(function (req, res, next) {
    // Access to XMLHttpRequest at 'http://35.189.20.17:8080/api/auth/signin' from origin 'http://35.197.181.218' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: The 'Access-Control-Allow-Origin' header has a value 'http://localhost:8081' that is not equal to the supplied origin.
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    // res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    // jjw: no need for x-access-token, we store the token in the cookies
    next();
  });

  app.post(
    '/api/auth/signup',
    [verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRolesExisted],
    controller.signup
  );

  // jjw: signin will return
  /*
  res.status(200).send({
    id: user._id,
    username: user.username,
    email: user.email,
    roles: authorities,
    accessToken: token, // jjw: a signed JWT token object
    refreshToken: refreshToken, // jjw: just a UUID
  });
  */
  app.post('/api/auth/signin', controller.signinNew);

  app.post('/api/auth/refreshtoken', controller.refreshToken);
};
