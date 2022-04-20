const { authJwt } = require("../middlewares");
const controller = require("../controllers/resident.controller");

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

  app.get(
    "/api/test/residents",
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastOwner],
    controller.residentGetAll
  );

  app.get(
    "/api/test/residents/:id",
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastOwner],
    controller.residentGet // jjw: here??? TODO: we can remove resident.controller entirely
  ); 

  app.post(
    "/api/test/residents",
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastOwner],
    controller.residentCreate // jjw: here??? TODO: we can remove resident.controller entirely
  ); 

  app.put(
    "/api/test/residents/:id",
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastOwner],
    controller.residentUpdate // jjw: here??? TODO: we can remove resident.controller entirely, just using item.controller??
  ); 

  app.delete(
    "/api/test/residents/:id",
    // [authJwt.verifyToken, authJwt.verifyIsAtLeastOwner], // jjw: here??? TODO: why don't need verifyIsAtLeastOwner?
    [authJwt.verifyAccToken],
    controller.residentDelete
  );

};
