const logger = require('../../utils/logger');

const configHelper = require('../../itemConfig/widget-config-helper-simplified');

// const db = require('../../models');
const ObjectId = require('mongodb').ObjectID;

// GET ALL
// jjw: TODO: read JS function declaration and definition:
// jjw:   https://stackoverflow.com/questions/16439949/define-local-function-in-javascript-use-var-or-not
exports.itemGetAll = (req, res, mongoosModel, configKey) => {
  logger.logAsStr('itemGetAll', 'configKey', configKey, 'debug');

  let itemMsgLabel = configHelper.getConfigMsgLabel(configKey);

  mongoosModel
    .find({})
    .lean() // jjw: NOTE: need to convert mongoose doc to a simple object https://stackoverflow.com/a/18070111
    .exec((err, items) => handleItems(err, items, itemMsgLabel, res));

  logger.logAsStr('itemGetAll', 'end', '');
};

// NOTE: define async function https://www.w3schools.com/js/js_async.asp
async function handleItems(err, items, itemMsgLabel, res) {
  // jjw: TODO: does it need to be async here???
  if (err) {
    logger.logAsJsonStr('handleItems', 'ERROR:', err);

    res.status(500).send({ message: err });
    return;
  }

  if (!items) {
    return res.status(404).send({ message: 'No ' + itemMsgLabel + ' found.' });
  }

  // Successful case
  logger.logAsJsonStr('handleItems', 'raw ' + itemMsgLabel + ' item from mongoose', items, 'debug');

  let itemsJson = [];
  items.map((x) => {
    // jjw: dynamically populate all the fields (except for id) based on
    // jjw:   configuration and item from the data source
    // let itemJson = populateFields(x, configKey); // jjw: re-thinking, we don't need this actually.

    // jjw: NOTE: to remove properties from objects and result another object
    // https://stackoverflow.com/a/208106
    // 1. by delete: delete myObject.propA
    // 2. by destructuring: as below.
    // NOTE: it is not creating a new object but using 'object reference': https://stackoverflow.com/a/44355489
    //    so be careful in case you will need to mutate the object you obtained from the
    //    destructuring - as it will impact the original object.
    // To 'partially cloning' the object,
    //  - use Object.assign: https://stackoverflow.com/q/44354705
    //  - or spreading syntax after ES6: https://stackoverflow.com/a/43376980
    const { _id, __v, ...itemJson } = x;

    itemJson.id = x._id;

    logger.logAsJsonStr('handleItems', 'itemJson', itemJson, 'debug');
    itemsJson.push(itemJson);
  });
  logger.logAsJsonStr('handleItems', 'itemsJson:', itemsJson, 'debug');
  res.status(200).send(itemsJson);
}
// NOTE: define exportable local function: https://stackoverflow.com/a/13859434
exports.handleItems = handleItems;

// var populateFields = (itemFromDataSource, configKey) => {
//   let populatedFieldsMap = { id: itemFromDataSource._id }; // init the map with id field

//   let configFieldsMap = configHelper.getLoadedConfigFieldsMap(configKey);
//   logger.logAsJsonStr('populateFields', 'configFieldsMap', configFieldsMap, 'DEBUG');

//   for ([key, val] of Object.entries(configFieldsMap)) {
//     logger.logAsStr('populateFields loop:', 'key', key, 'DEBUG');
//     logger.logAsJsonStr('populateFields loop:', 'val', val, 'DEBUG');

//     let fieldNameInDS = val['nameInDataSource'];
//     logger.logAsStr('populateFields loop:', 'fieldNameInDS', fieldNameInDS, 'DEBUG');

//     let fieldValueFromDS = itemFromDataSource[fieldNameInDS];
//     logger.logAsStr('populateFields loop:', 'fieldValueFromDS', fieldValueFromDS, 'DEBUG');

//     populatedFieldsMap[fieldNameInDS] = fieldValueFromDS;

//     // firstName: x.firstName,
//     // lastName: x.lastName,
//     // DOB: x.DOB, // jjw: ???TODO: DOB not showing
//     // lastKnownPayDate: x.lastKnownPayDate,
//     // payFrequency: x.payFrequency
//   }
//   logger.logAsJsonStr('populateFields', 'populatedFieldsMap', populatedFieldsMap, 'DEBUG');

//   return populatedFieldsMap;
// };

// GET BY ID
exports.itemGet = (req, res, mongoosModel, configKey) => {
  logger.logAsStr('itemGet', 'configKey', configKey);
  logger.logAsStr('itemGet', 'req.params.id', req.params.id);

  var itemId = req.params.id;

  let itemMsgLabel = configHelper.getConfigMsgLabel(configKey);

  mongoosModel.findOne({ _id: ObjectId(itemId) }).exec(async (err, itemFound) => {
    if (err) {
      logger.logAsJsonStr('itemGet', 'ERROR:', err);

      res.status(500).send({ message: err });
      return;
    }

    if (!itemFound) {
      return res
        .status(404)
        .send({ message: 'No ' + itemMsgLabel + ' with id: {' + itemId + '} found.' });
    }

    console.log('itemGet:', JSON.stringify(itemFound));
    res.status(200).send(itemFound);
  });

  // console.log("itemDelete() end");
};

// CREATE
exports.itemCreate = (req, res, mongoosModel, configKey) => {
  logger.logAsStr('itemCreate', 'configKey', configKey);

  let itemMsgLabel = configHelper.getConfigMsgLabel(configKey);

  let payload = req.body;
  logger.logAsJsonStr('itemCreate', 'payload', payload);

  // mongoosModel.create(payload)
  //   .exec(async (err, itemCreated) => {
  //     // jjw: itemUpdated will be, if successful,
  //     // jjw:   'itemUpdate: {"n":1,"nModified":1,"ok":1}'
  //     // jjw:   https://github.com/Automattic/monk/issues/149#issuecomment-232569704
  //     // jjw:     - n is the number of matched documents
  //     // jjw:     - nModified is the number of modified documents
  //       if (err) {
  //         res.status(500).send({ message: err });
  //         return;
  //       }

  //       if (!itemCreated) {
  //         return res.status(404).send({ message:
  //           "No " + itemMsgLabel + " has been created" });
  //       }

  //       logger.logAsJsonStr("itemCreate", "itemCreated", itemCreated);
  //       res.status(200).send(itemCreated);
  //     }
  //   );

  mongoosModel.create(payload, async (err, itemCreated) => {
    // jjw: itemUpdated will be, if successful,
    // jjw:   'itemUpdate: {"n":1,"nModified":1,"ok":1}'
    // jjw:   https://github.com/Automattic/monk/issues/149#issuecomment-232569704
    // jjw:     - n is the number of matched documents
    // jjw:     - nModified is the number of modified documents
    if (err) {
      logger.logAsJsonStr('itemCreate', 'ERROR:', err);

      res.status(500).send({ message: err });
      return;
    }

    if (!itemCreated) {
      return res.status(404).send({ message: 'No ' + itemMsgLabel + ' has been created' });
    }

    logger.logAsJsonStr('itemCreate', 'itemCreated', itemCreated);
    res.status(200).send(itemCreated);
  });

  // console.log("itemDelete() end");
};

// UPDATE
exports.itemUpdate = (req, res, mongoosModel, configKey) => {
  logger.logAsStr('itemUpdate', 'configKey', configKey);
  logger.logAsStr('itemUpdate', 'req.params.id', req.params.id);

  // logger.logAsJsonStr("itemUpdate", "req", req);

  var itemId = req.params.id;

  let itemMsgLabel = configHelper.getConfigMsgLabel(configKey);

  let payload = req.body;
  logger.logAsJsonStr('itemUpdate', 'payload', payload);

  // jjw: https://www.geeksforgeeks.org/mongoose-updateone-function/?ref=lbp
  mongoosModel.updateOne({ _id: ObjectId(itemId) }, payload).exec(async (err, itemUpdated) => {
    // jjw: itemUpdated will be, if successful,
    // jjw:   'itemUpdate: {"n":1,"nModified":1,"ok":1}'
    // jjw:   https://github.com/Automattic/monk/issues/149#issuecomment-232569704
    // jjw:     - n is the number of matched documents
    // jjw:     - nModified is the number of modified documents
    if (err) {
      logger.logAsJsonStr('itemUpdate', 'ERROR:', err);

      res.status(500).send({ message: err });
      return;
    }

    if (!itemUpdated) {
      return res
        .status(404)
        .send({ message: 'No ' + itemMsgLabel + ' with id: {' + itemId + '} found.' });
    }

    console.log('itemUpdate:', JSON.stringify(itemUpdated));
    res.status(200).send(itemUpdated);
  });

  // console.log("itemDelete() end");
};

// DELETE
// jjw; TODO: here???!!! generalize this as with the get method above
exports.itemDelete = (req, res, mongoosModel, configKey) => {
  logger.logAsStr('itemDelete', 'configKey', configKey);
  logger.logAsStr('itemDelete', 'req.params.id', req.params.id);

  var itemId = req.params.id;

  let itemMsgLabel = configHelper.getConfigMsgLabel(configKey);

  mongoosModel.findOneAndDelete({ _id: ObjectId(itemId) }).exec(async (err, itemDeleted) => {
    if (err) {
      logger.logAsJsonStr('itemDelete', 'ERROR:', err);

      res.status(500).send({ message: err });
      return;
    }

    if (!itemDeleted) {
      return res
        .status(404)
        .send({ message: 'No ' + itemMsgLabel + ' with id: {' + itemId + '} found.' });
    }

    console.log('itemDeleted:', JSON.stringify(itemDeleted));
    res.status(200).send(itemDeleted);
  });

  // console.log("itemDelete() end");
};
