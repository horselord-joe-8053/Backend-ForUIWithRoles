// const Logger = require("../utils/logger.tsx");
const logger = require("../utils/logger");

const configHelper = require("../itemConfig/widget-config-helper");


const db = require("../models");
const { resident: Resident } = db;
const ObjectId = require('mongodb').ObjectID;

// jjw; TODO: here???!!! put this into resident.controller
exports.residentGet = (req, res) => {
  itemGet(req, res, Resident, "CRUD_Resident");
};

// jjw: TODO: read JS function declaration and definition: 
// jjw:   https://stackoverflow.com/questions/16439949/define-local-function-in-javascript-use-var-or-not
var itemGet = (req, res, mongoosModel, configKey) => {  
  console.log("itemGet()");

  mongoosModel.find({})
    .exec(async (err, items) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        if (!items) {
          return res.status(404).send({ message: "No item found." });
        }

        // Successful case
        console.log("items:", JSON.stringify(items));

        let itemsJson = [];
        items.map( x => {

          // jjw: dynamically populate all the fields (except for id) based on 
          // jjw:   configuration and item from the data source
          let itemJson = populateFields(x, configKey);
          logger.logAsJsonStr("itemGet", "itemJson after populateFields()", itemJson);
          itemsJson.push(itemJson);
        })
        logger.logAsJsonStr("itemGet", "item Json:", itemsJson);
        res.status(200).send(itemsJson);
      }
    );

  console.log("itemGet() end");
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

// jjw; TODO: here???!!! generalize this as with the get method above
exports.residentDeletion = (req, res) => {
  console.log("residentDeletion(), req.params.id:{" + req.params.id + "}");
  var residentId = req.params.id;

  Resident.findOneAndDelete({_id: ObjectId(residentId)})
    .exec(async (err, residentDeleted) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        if (!residentDeleted) {
          return res.status(404).send({ message: 
            "No residents with id: {" + residentId + "} found." });
        }

        console.log("residentDeleted:", JSON.stringify(residentDeleted));
        res.status(200).send(residentDeleted);
      }
    );

  console.log("residentDeletion() end");
  
};


