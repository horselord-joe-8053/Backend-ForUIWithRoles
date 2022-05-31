const express = require('express');
const cors = require('cors');
const dbConfig = require('./app/config/db.config');

const app = express();

const dataInitializer = require('./app/dataInitialization/data-initializer');

const logger = require('./app/utils/logger');

// const { isEmpty } = require('lodash');

let corsOptions = {
  // credentials: true,
  // origin: 'http://localhost:8081',
  // origin: '*',
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
  logger.logAsJsonStr('server.js ==== app.use()', 'req.url', req.url);

  logger.logAsJsonStr('server.js app.use()', 'req.cookies', req.cookies);

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

const db = require('./app/models');
const db_connect_str = `mongodb://${dbConfig.CONNECT_STR}/${dbConfig.DB}?authSource=admin`;
console.log('db_connect_str:' + db_connect_str);

db.mongoose
  .connect(db_connect_str, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Successfully connect to MongoDB.');
    dataInitializer.initial();
  })
  .catch((err) => {
    console.error('Connection error', err);
    process.exit();
  });

// jjw: TODO: cleanup
// // simple route
// app.get('/', (req, res) => {
//   res.json({ message: 'Welcome to bezkoder application.' });
// });

// jjw: we are passsing an express app object to the files that
// jjw:   contain the 'sub routes'
// routes
require('./app/routes/auth.routes')(app);
// require('./app/routes/user.routes')(app);
require('./app/routes/resident.routes')(app);
require('./app/routes/staff.routes')(app);
require('./app/routes/timesheet.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
