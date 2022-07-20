const { authJwt } = require('../middlewares');
const controller = require('../controllers/payment.controller');

// jjw: we are passsing an express 'app' object to here
// jjw:   which will call .use(...) .post(...) to add more
// jjw:   routes

const API_URL = '/api/test' + '/';
const ADD_PAID_DATES_PATH = 'add-paid-dates';

module.exports = function (app) {
  app.use(function (req, res, next) {
    // res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    // jjw: no need for x-access-token, we store the token in the cookies
    next();
  });

  app.put(
    API_URL + ADD_PAID_DATES_PATH,
    // [authJwt.verifyAccToken, authJwt.verifyIsAtLeastStaff],
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastOwner],
    controller.addPaidDates
  );
};
