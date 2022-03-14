const db = require("../models");
const { resident: Resident } = db;
const ObjectId = require('mongodb').ObjectID;

// jjw; TODO: ???
exports.residentsSection = (req, res) => {

  console.log("residentsSection()");

  Resident.find({})
    .exec(async (err, residents) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        if (!residents) {
          return res.status(404).send({ message: "No residents found." });
        }

        // Successful case
        console.log("residents:", JSON.stringify(residents));

        let residentsJson = [];
        residents.map( x => {
          let residentJson = {
            id: x._id,
            firstName: x.firstName,
            lastName: x.lastName,
            DOB: x.DOB,
            lastKnownPayDate: x.lastKnownPayDate,
            payFrequency: x.payFrequency 
          };
          residentsJson.push(residentJson);
        })
        console.log("residentsJson:", JSON.stringify(residentsJson));
        res.status(200).send(residentsJson);
      }
    );

  console.log("residentsSection() end");
}; 

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


