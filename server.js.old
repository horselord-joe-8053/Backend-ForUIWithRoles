const express = require("express");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");

const app = express();

const logger = require("./app/utils/logger");

const {isEmpty} = require ("lodash");

let corsOptions = {
  credentials: true,
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// jjw: https://stackoverflow.com/a/16209531
// jjw: http://expressjs.com/en/resources/middleware/cookie-parser.html
// need cookieParser middleware before we can do anything with cookies
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// jjw: TODO: Here ??? on client side AuthService.login the accessToken is not set on response.data.accessToken
// jjw:   on the backend during login -- auth.controller.js signin()

app.use(function (req, res, next) {
  
  logger.logAsJsonStr("server.js ==== app.use()", "req.url", req.url);
  
  logger.logAsJsonStr("server.js app.use()", "req.cookies", req.cookies);

  // // check if client sent cookie
  // var cookie = req.cookies;
  // if (cookie === undefined || isEmpty(cookie)) {
  //   // // no: set a new cookie
  //   // var randomNumber=Math.random().toString();
  //   // randomNumber=randomNumber.substring(2,randomNumber.length);
  //   // res.cookie('cookieName',randomNumber, { maxAge: 900000, httpOnly: true });
  //   // console.log('--- cookie did NOT exist and manually created successfully');

  //   console.log('--- req.cookies is undefined or empty');
  // } else {
  //   // yes, cookie was already present 
  //   console.log('--- req.cookies is defined', cookie);
  // } 
  next(); // <-- important!
});

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

// jjw: TODO: maybe all the roles should be from a config file? necessary?
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

// jjw: Add dummy Residents when all residents are deleted for initial testing. TODO: remove this later
function initResidents() {

  Resident.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {

      new Resident({
        firstName: "resident1_fn",
        lastName: "resident1_ln",
        // jjw: use Date https://mongoosejs.com/docs/tutorials/dates.html
        dob: "1983-11-16",
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
        dob: "1982-11-16",
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
