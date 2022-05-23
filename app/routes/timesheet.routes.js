const { authJwt } = require('../middlewares');
const controller = require('../controllers/timesheet.controller');

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

  // app.get(
  //   '/api/test/timesheet/:fromDateStr/:toDateStr',
  //   [authJwt.verifyAccToken, authJwt.verifyIsAtLeastOwner],
  //   controller.getShiftsInDaysByStartEnd
  // );

  app.get(
    '/api/test/timesheet/:lastKnownSalaryDateStr/:salaryFrequency/:anchorDateStr',
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastOwner],
    controller.getShiftsInDays
  );

  app.get(
    '/api/test/shifttypes',
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastOwner],
    controller.getShiftTypes
  );

  // app.get(
  //   '/api/test/cashpayments',
  //   [authJwt.verifyAccToken, authJwt.verifyIsAtLeastOwner],
  //   controller.getCashPayments
  // );

  app.get(
    '/api/test/paymentArrangements',
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastOwner],
    controller.getPaymentArrangements
  );

  // jjw: put workshift query here for now, need organize file and URL better
  app.put(
    '/api/test/shifts',
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastOwner],
    controller.updateShifts
  );
};
