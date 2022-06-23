const { authJwt } = require('../middlewares');
const controller = require('../controllers/contact.controller');

// jjw: we are passsing an express 'app' object to here
// jjw:   which will call .use(...) .post(...) to add more
// jjw:   routes
module.exports = function (app) {
  app.use(function (req, res, next) {
    // res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    // jjw: no need for x-access-token, we store the token in the cookies
    next();
  });

  app.get(
    '/api/test/contact',
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastStaff],
    controller.contactGetAll
  );

  app.get(
    '/api/test/contact/:id',
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastOwner],
    controller.contactGet // jjw: here??? TODO: we can remove staff.controller entirely

    /*
    we may be able to do everything based on config files

    exports.staffGet = (req, res) => {
      itemController.itemGet(req, res, Resident, configKey);
    };

    where 'Resident' is a mongoosModel that we can pass in;
    and we can create this Model from the config 

    */
  );

  app.post(
    '/api/test/contact',
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastOwner],
    controller.contactCreate // jjw: here??? TODO: we can remove staff.controller entirely
  );

  app.put(
    '/api/test/contact/:id',
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastOwner],
    controller.contactUpdate // jjw: here??? TODO: we can remove staff.controller entirely, just using item.controller??
  );

  app.delete(
    '/api/test/contact/:id',
    // [authJwt.verifyToken, authJwt.verifyIsAtLeastOwner], // jjw: here??? TODO: why don't need verifyIsAtLeastOwner?
    [authJwt.verifyAccToken],
    controller.contactDelete
  );
};
