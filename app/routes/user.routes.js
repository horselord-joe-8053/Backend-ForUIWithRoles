const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

// jjw: we are passsing an express 'app' object to here
// jjw:   which will call .use(...) .post(...) to add more 
// jjw:   routes
module.exports = function(app) {
  app.use(function(req, res, next) {
    // res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept"); 
    // jjw: no need for x-access-token, we store the token in the cookies
    next();
  });

  // jjw: corresponding to 
  // jjw: /Users/jjw8053/GoogleDrive2022/Future/UI_Learn_2022/bezkoder-react-typescript-login-example/Frontend/jjw-FRONTEND-react-typescript-login-example/src/services/user.service.ts
  app.get("/api/test/all", controller.allAccess);

  // jjw: NOTE before these resource request, singin already happened
  // jjw: authJwt check for expired token
  app.get("/api/test/current-user", [authJwt.verifyAccToken], controller.currUserBoard);

  app.get(
    "/api/test/staff",
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastStaff],
    controller.staffBoard
  );

  app.get(
    "/api/test/owner",
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastOwner],
    controller.ownerBoard
  );

  app.get(
    "/api/test/admin",
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastAdmin],
    controller.adminBoard
  );
};
