const residentsInitializer = require('./residents/resident-initializer');
const staffInitializer = require('./staff/staff-initializer');
const timesheetInitializer = require('./timesheets/timesheet-initializer.js');

const roleDataArr = require('./roles/roles.json');

const db = require('../../app/models');
const Role = db.role;
const Resident = db.resident;
const Staff = db.staff;
const ShiftsInADay = db.shiftsInADay;

const logger = require('../utils/logger');

// exports.getData = () => {
//   let combined = {
//     resident_data: residentsInitializer.getData(),
//     staff_data: staffInitializer.getData(),
//   };

//   logger.logAsJsonStr('data-initializer.getData', 'ALL combined', combined);

//   return combined;
// };

exports.initial = () => {
  logger.logAsStr('data-initializer.initial', 'start', '');

  initRoles();
  // jjw: TODO: here!!! cleanup roles including initialize them properly
  // initItems(roleDataArr, Role, 'Role');

  initItems(residentsInitializer.getData(), Resident, 'Resident');
  initItems(staffInitializer.getData(), Staff, 'Staff');
  initItems(timesheetInitializer.getData(), ShiftsInADay, 'ShiftsInADay');

  logger.logAsStr(
    'data-initializer.initial',
    'end',
    ' but DB data initialization may continue asynchronously...'
  );
  // initItems(timeSheetInitializer.getData(), ShiftsInADay, 'ShiftsInADay'); // TODO: need staff to be populated first
};

// var initData = dataInitializer.getData();

// jjw: Add dummy Residents when all residents are deleted for initial testing. TODO: remove this later
// function initResidents() {
//   var initResidentDataArr = initData['resident_data'];
//   logger.logAsJsonStr('server.js initResidents', 'residentDataArr', initResidentDataArr);

//   initResidentDataArr.forEach((data, index) =>
//     Resident.estimatedDocumentCount((err, count) => {
//       if (!err && count === 0) {
//         new Resident(data).save((err) => {
//           if (err) {
//             console.log('error', err);
//           }
//           console.log("added a 'resident' to residents collection");
//         });
//       }
//     })
//   );
// }

/*
function initItems(dataArr, mongoosModel, itemMsgLabel) {
  logger.logAsJsonStr('server.js initItems for ' + itemMsgLabel, 'dataArr', dataArr, 'Debug');

  dataArr.forEach((data, index) =>
    mongoosModel.estimatedDocumentCount((err, count) => {
      if (!err && count === 0) {
        // new Resident(data).save((err) => {
        //   if (err) {
        //     console.log('error', err);
        //   }
        //   console.log("added a 'resident' to residents collection");
        // });

        mongoosModel.create(data, (err, itemCreated) => {
          if (err) {
            logger.logAsJsonStr(
              'dataInitializer.initItems',
              'ERROR! when creating a ' + itemMsgLabel,
              err
            );
          } else {
            logger.logAsJsonStr(
              'dataInitializer.initItems',
              'Success! created a ' + itemMsgLabel,
              ''
            );
          }
        });
      }
    })
  );
}
*/

function initItems(dataArr, mongoosModel, itemMsgLabel) {
  logger.logAsJsonStr('server.js initItems for ' + itemMsgLabel, 'dataArr', dataArr, 'debug');
  logger.logAsJsonStr('server.js initItems for ' + itemMsgLabel, 'dataArr.length', dataArr.length);

  mongoosModel.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      dataArr.forEach((data, index) => {
        mongoosModel.create(data, (err, itemCreated) => {
          if (err) {
            logger.logAsJsonStr(
              'dataInitializer.initItems',
              'ERROR! when creating a ' + itemMsgLabel + ' at index ' + index,
              err
            );
          } else {
            logger.logAsStr(
              'dataInitializer.initItems',
              'Success! created a ' + itemMsgLabel + ' at index ' + index,
              ''
            );
          }
        });
        // jjw: TODO: this needs to be syncrhonized for purpose
        // jjw: - avoid race condition between initialization of large data and later UI operation
        // jjw: - we need an accurate count after initialization
        // jjw:   (db.getCollection('shiftsinadays').estimatedDocumentCount() in Robo 3T for now)
      });
    } else if (err) {
      logger.logAsJsonStr(
        'data-initializer.initItems',
        'ERROR in mongoosModel.estimatedDocumentCount for ' + itemMsgLabel,
        err
      );
    } else {
      logger.logAsStr(
        'dataInitializer.initItems',
        itemMsgLabel + ' collection is already populate: Count: ',
        count
      );
    }
  });
}

// jjw: TODO: maybe all the roles should be from a config file? necessary?
function initRoles() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: 'user',
      }).save((err) => {
        if (err) {
          console.log('error', err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: 'staff',
      }).save((err) => {
        if (err) {
          console.log('error', err);
        }

        console.log("added 'staff' to roles collection");
      });

      new Role({
        name: 'owner',
      }).save((err) => {
        if (err) {
          console.log('error', err);
        }

        console.log("added 'owner' to roles collection");
      });

      new Role({
        name: 'admin',
      }).save((err) => {
        if (err) {
          console.log('error', err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}
