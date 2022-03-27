const db = require("../models");
const { resident: Resident } = db;
const itemController = require("./item/item.controller");

const configKey = "RESIDENT";

// jjw; TODO: here???!!! put this into resident.controller
exports.residentGetAll = (req, res) => {
  itemController.itemGetAll(req, res, Resident, configKey);
};

exports.residentGet = (req, res) => {
  itemController.itemGet(req, res, Resident, configKey);
};

exports.residentCreate = (req, res) => {
  itemController.itemCreate(req, res, Resident, configKey);
};

exports.residentUpdate = (req, res) => {
  itemController.itemUpdate(req, res, Resident, configKey);
};

exports.residentDelete = (req, res) => {
  itemController.itemDelete(req, res, Resident, configKey);
};

// exports.residentDeletion = (req, res) => {
//   console.log("residentDeletion(), req.params.id:{" + req.params.id + "}");
//   var residentId = req.params.id;

//   Resident.findOneAndDelete({_id: ObjectId(residentId)})
//     .exec(async (err, residentDeleted) => {
//         if (err) {
//           res.status(500).send({ message: err });
//           return;
//         }

//         if (!residentDeleted) {
//           return res.status(404).send({ message: 
//             "No residents with id: {" + residentId + "} found." });
//         }

//         console.log("residentDeleted:", JSON.stringify(residentDeleted));
//         res.status(200).send(residentDeleted);
//       }
//     );

//   console.log("residentDeletion() end");
  
// };


