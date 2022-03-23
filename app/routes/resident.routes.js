const { authJwt } = require("../middlewares");
const controller = require("../controllers/item.controller");

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

  app.get(
    "/api/test/residents",
    [authJwt.verifyToken, authJwt.isOwner],
    controller.residentGet
    // (req, res) => { itemGet(req, res, Resident, "CRUD_Resident");} // jjw: here??? TODO: like this we can remove resident.controller entirely
  );

  app.delete(
    "/api/test/residents/:id",
    // [authJwt.verifyToken, authJwt.isOwner],
    [authJwt.verifyToken],
    controller.residentDeletion
  );

};
