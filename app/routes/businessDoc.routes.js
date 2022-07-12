const { authJwt } = require('../middlewares');
const controller = require('../controllers/businessDoc.controller');

// jjw: we are passsing an express 'app' object to here
// jjw:   which will call .use(...) .post(...) to add more
// jjw:   routes
const servicePath = 'business-docs';

module.exports = function (app) {
  app.use(function (req, res, next) {
    // res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    // jjw: no need for x-access-token, we store the token in the cookies
    next();
  });

  app.get(
    '/api/test/' + servicePath,
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastSuperUser],
    controller.getAll
  );

  app.get(
    '/api/test/' + servicePath + '/:id',
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastSuperUser],
    controller.get // jjw: TODO: we can remove this controller entirely

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
    '/api/test/' + servicePath,
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastOwner],
    controller.create // jjw: here??? TODO: we can remove staff.controller entirely
  );

  app.put(
    '/api/test/' + servicePath + '/:id',
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastOwner],
    controller.update // jjw: here??? TODO: we can remove staff.controller entirely, just using item.controller??
  );

  app.delete(
    '/api/test/' + servicePath + '/:id',
    // [authJwt.verifyToken, authJwt.verifyIsAtLeastOwner], // TODO: if has these, apparently, we will get "Error: Route.delete() requires a callback function but got a [object Undefined]"
    [authJwt.verifyAccToken],
    controller.delete
  );
};
