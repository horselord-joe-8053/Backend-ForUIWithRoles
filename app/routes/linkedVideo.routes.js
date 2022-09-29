const { authJwt } = require('../middlewares');
const controller = require('../controllers/linkedVideo.controller');

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

  // jjw: TODO: the following 'linkedVideo' can be extracted to a string to make this easier obviously
  // jjw: TODO: , but because controller.linkedVideoGetAll method need to change too so a bit silly
  // jjw: TODO: way for now is to file-edit replace all 'linkedVideo' to other text respectively
  // jjw: TODO: . This will be revamped all-together when we rein all the CRUD controllors to one

  let uriResourceStr = 'linked-videos'; // corresponding to front end front_end/src/config/video/main-video-info/config-top.json

  app.get(
    '/api/test/linked-videos',
    // '/api/test/' + uriResourceStr,
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastStaff],
    controller.linkedVideoGetAll
  );

  app.get(
    '/api/test/' + uriResourceStr + '/:id',
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastStaff],
    controller.linkedVideoGet // jjw: here??? TODO: we can remove staff.controller entirely

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
    '/api/test/' + uriResourceStr,
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastOwner],
    controller.linkedVideoCreate // jjw: here??? TODO: we can remove staff.controller entirely
  );

  app.put(
    '/api/test/' + uriResourceStr + '/:id',
    [authJwt.verifyAccToken, authJwt.verifyIsAtLeastOwner],
    controller.linkedVideoUpdate // jjw: here??? TODO: we can remove staff.controller entirely, just using item.controller??
  );

  app.delete(
    '/api/test/' + uriResourceStr + '/:id',
    // [authJwt.verifyToken, authJwt.verifyIsAtLeastOwner], // jjw: here??? TODO: why don't need verifyIsAtLeastOwner?
    [authJwt.verifyAccToken],
    controller.linkedVideoDelete
  );
};
