const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

// jjw: we are passsing an express 'app' object to here
// jjw:   which will call .use(...) .post(...) to add more 
// jjw:   routes
module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // jjw: corresponding to 
  // jjw: /Users/jjw8053/GoogleDrive2022/Future/UI_Learn_2022/bezkoder-react-typescript-login-example/Frontend/jjw-FRONTEND-react-typescript-login-example/src/services/user.service.ts
  app.get("/api/test/all", controller.allAccess);

  // jjw: NOTE before these resource request, singin already happened
  // jjw: authJwt check for expired token
  app.get("/api/test/current-user", [authJwt.verifyToken], controller.currUserBoard);

  app.get(
    "/api/test/staff",
    [authJwt.verifyToken, authJwt.isStaff],
    controller.staffBoard
  );

  app.get(
    "/api/test/owner",
    [authJwt.verifyToken, authJwt.isOwner],
    controller.ownerBoard
  );

  app.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );
};
