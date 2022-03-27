// const Logger = require("../utils/logger.tsx");
const logger = require("../../utils/logger");

const configHelper = require("../../itemConfig/widget-config-helper");

const db = require("../../models");
const { resident: Resident } = db;
const ObjectId = require('mongodb').ObjectID;


// GET ALL
// jjw: TODO: read JS function declaration and definition: 
// jjw:   https://stackoverflow.com/questions/16439949/define-local-function-in-javascript-use-var-or-not
exports.itemGetAll = (req, res, mongoosModel, configKey) => {  
  logger.logAsStr("itemGetAll", "configKey", configKey);

  let itemMsgLabel = configHelper.getConfigMsgLabel(configKey);

  mongoosModel.find({})
    .exec(async (err, items) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        if (!items) {
          return res.status(404).send({ message: "No " + itemMsgLabel + " found." });
        }

        // Successful case
        console.log("items:", JSON.stringify(items));

        let itemsJson = [];
        items.map( x => {

          // jjw: dynamically populate all the fields (except for id) based on 
          // jjw:   configuration and item from the data source
          let itemJson = populateFields(x, configKey);
          logger.logAsJsonStr("itemGetAll", "itemJson after populateFields()", itemJson);
          itemsJson.push(itemJson);
        })
        logger.logAsJsonStr("itemGetAll", "item Json:", itemsJson);
        res.status(200).send(itemsJson);
      }
    );

  console.log("itemGetAll() end");
}; 

var populateFields = (itemFromDataSource, configKey) => {
  let populatedFieldsMap = {id : itemFromDataSource._id}; // init the map with id field

  let configFieldsMap = configHelper.getLoadedConfigFieldsMap(configKey);
  logger.logAsJsonStr("populateFields", "configFieldsMap", configFieldsMap);

  for ([key, val] of Object.entries(configFieldsMap)) {
    logger.logAsStr("populateFields loop:", "key", key);
    logger.logAsJsonStr("populateFields loop:", "val", val);

    let fieldNameInDS = val["nameInDataSource"];
    logger.logAsStr("populateFields loop:", "fieldNameInDS", fieldNameInDS);

    let fieldValueFromDS = itemFromDataSource[fieldNameInDS];
    logger.logAsStr("populateFields loop:", "fieldValueFromDS", fieldValueFromDS);

    populatedFieldsMap[fieldNameInDS] = fieldValueFromDS;

                // firstName: x.firstName,
            // lastName: x.lastName,
            // DOB: x.DOB, // jjw: ???TODO: DOB not showing
            // lastKnownPayDate: x.lastKnownPayDate,
            // payFrequency: x.payFrequency 
  }
  logger.logAsJsonStr("populateFields", "populatedFieldsMap", populatedFieldsMap);

  return populatedFieldsMap;
}

// GET BY ID
exports.itemGet = (req, res, mongoosModel, configKey) => {
  logger.logAsStr("itemGet", "configKey", configKey);
  logger.logAsStr("itemGet", "req.params.id", req.params.id);

  var itemId = req.params.id;

  let itemMsgLabel = configHelper.getConfigMsgLabel(configKey);

  mongoosModel.findOne({_id: ObjectId(itemId)})
    .exec(async (err, itemFound) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        if (!itemFound) {
          return res.status(404).send({ message: 
            "No " + itemMsgLabel + " with id: {" + itemId + "} found." });
        }

        console.log("itemGet:", JSON.stringify(itemFound));
        res.status(200).send(itemFound);
      }
    );

  // console.log("itemDelete() end");
  
};

// CREATE
exports.itemCreate = (req, res, mongoosModel, configKey) => {
  logger.logAsStr("itemCreate", "configKey", configKey);

  let itemMsgLabel = configHelper.getConfigMsgLabel(configKey);

  let payload = req.body;
  logger.logAsJsonStr("itemCreate", "payload", payload);

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
          res.status(500).send({ message: err });
          return;
        }

        if (!itemCreated) {
          return res.status(404).send({ message: 
            "No " + itemMsgLabel + " has been created" });
        }

        logger.logAsJsonStr("itemCreate", "itemCreated", itemCreated);
        res.status(200).send(itemCreated);
      }
    );

  // console.log("itemDelete() end");
  
};


// UPDATE
exports.itemUpdate = (req, res, mongoosModel, configKey) => {
  logger.logAsStr("itemUpdate", "configKey", configKey);
  logger.logAsStr("itemUpdate", "req.params.id", req.params.id);

  // logger.logAsJsonStr("itemUpdate", "req", req);

  var itemId = req.params.id;

  let itemMsgLabel = configHelper.getConfigMsgLabel(configKey);

  let payload = req.body;
  logger.logAsJsonStr("itemUpdate", "payload", payload);

  // jjw: https://www.geeksforgeeks.org/mongoose-updateone-function/?ref=lbp
  mongoosModel.updateOne({_id: ObjectId(itemId)}, payload)
    .exec(async (err, itemUpdated) => {
      // jjw: itemUpdated will be, if successful, 
      // jjw:   'itemUpdate: {"n":1,"nModified":1,"ok":1}'
      // jjw:   https://github.com/Automattic/monk/issues/149#issuecomment-232569704
      // jjw:     - n is the number of matched documents
      // jjw:     - nModified is the number of modified documents
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        if (!itemUpdated) {
          return res.status(404).send({ message: 
            "No " + itemMsgLabel + " with id: {" + itemId + "} found." });
        }

        console.log("itemUpdate:", JSON.stringify(itemUpdated));
        res.status(200).send(itemUpdated);
      }
    );

  // console.log("itemDelete() end");
  
};

// DELETE
// jjw; TODO: here???!!! generalize this as with the get method above
exports.itemDelete = (req, res, mongoosModel, configKey) => {
  logger.logAsStr("itemDelete", "configKey", configKey);
  logger.logAsStr("itemDelete", "req.params.id", req.params.id);

  var itemId = req.params.id;

  let itemMsgLabel = configHelper.getConfigMsgLabel(configKey);

  mongoosModel.findOneAndDelete({_id: ObjectId(itemId)})
    .exec(async (err, itemDeleted) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        if (!itemDeleted) {
          return res.status(404).send({ message: 
            "No " + itemMsgLabel + " with id: {" + itemId + "} found." });
        }

        console.log("itemDeleted:", JSON.stringify(itemDeleted));
        res.status(200).send(itemDeleted);
      }
    );

  // console.log("itemDelete() end");
  
};


