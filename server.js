const express = require("express");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");

const app = express();

let corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
const Role = db.role;
const Resident = db.resident;

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

// jjw: we are passsing an express app object to the files that
// jjw:   contain the 'sub routes'
// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/resident.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initRoles() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "staff"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'staff' to roles collection");
      });

      new Role({
        name: "owner"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'owner' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
};

function initResidents() {

  Resident.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {

      new Resident({
        firstName: "resident1_fn",
        lastName: "resident1_ln",
        // jjw: use Date https://mongoosejs.com/docs/tutorials/dates.html
        DOB: "1983-11-16",
        lastKnownPayDate: "2022-02-21",
        payFrequency: "fortnightly"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added a 'resident' to residents collection");
      });

      new Resident({
        firstName: "resident2_fn",
        lastName: "resident2_ln",
        // jjw: use Date https://mongoosejs.com/docs/tutorials/dates.html
        DOB: "1982-11-16",
        lastKnownPayDate: "2021-02-21",
        payFrequency: "monthly"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added a 'resident' to residents collection");
      });

    }
  });
};

function initial() {

  initRoles();

  initResidents(); 

}
