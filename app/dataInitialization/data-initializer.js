const roleInitializer = require('./roles/role-initializer');
const residentsInitializer = require('./residents/resident-initializer');
const staffInitializer = require('./staff/staff-initializer');
const contactInitializer = require('./contacts/contact-initializer');
const timesheetInitializer = require('./timesheets/timesheet-initializer.js');
const shiftTypeInitializer = require('./shiftType/shiftType-initializer.js');
const paymentInitializer = require('./paymentArrangements/payment-initializer.js');

const db = require('../../app/models');
const Role = db.role;
const Contact = db.contact;
const Resident = db.resident;
const Staff = db.staff;
const ShiftsInADay = db.shiftsInADay;
const ShiftType = db.shiftType;
const PaymentArrangement = db.paymentArrangement;

const logger = require('../utils/logger');
const { estimatedDocumentCount } = require('../models/resident.model');

// https://stackoverflow.com/a/42964310
exports.initialize = async () => {
  logger.logAsStr('data-initializer.initialize', 'start', '');

  // TODO: totaly async this function and use await for orderly initialization
  await initItems(roleInitializer, Role, 'Role');
  await initItems(residentsInitializer, Resident, 'Resident');
  await initItems(staffInitializer, Staff, 'Staff');
  await initItems(contactInitializer, Contact, 'Contact');
  await initItems(shiftTypeInitializer, ShiftType, 'ShiftType');
  await initItems(timesheetInitializer, ShiftsInADay, 'ShiftsInADay');
  await initItems(paymentInitializer, PaymentArrangement, 'PaymentArrangement');

  logger.logAsStr('data-initializer.initialize', 'completed', '');
};

// https://www.w3schools.com/js/js_async.asp
async function initItems(initializer, mongoosModel, itemMsgLabel) {
  // https://mongoosejs.com/docs/api.html#model_Model.count
  // This method is deprecated. If you want to count the number of documents in a collection, e.g. count({}), use the estimatedDocumentCount() function instead. Otherwise, use the countDocuments() function instead.
  // let count = await mongoosModel.count({}); // return a promise

  // https://mongoosejs.com/docs/api.html#model_Model.countDocuments
  // let count = await mongoosModel.countDocuments({}); // assume this is async

  // https://mongoosejs.com/docs/api.html#model_Model.estimatedDocumentCount
  let count = await mongoosModel.estimatedDocumentCount({}); // assume this is async

  mongoosModel;
  logger.logAsStr(
    'dataInitializer.initItems',
    itemMsgLabel + ' countDocuments() -> Count: ',
    count
  );
  if (count > 0) {
    logger.logAsStr(
      'dataInitializer.initItems',
      itemMsgLabel + ' collection is already populate: Count: ',
      count
    );
    return;
  }

  dataArr = await initializer.getData(); // TODO: shouldn't need 'await' here ??

  logger.logAsJsonStr('server.js initItems for ' + itemMsgLabel, 'dataArr', dataArr, 'debug');
  logger.logAsJsonStr('server.js initItems for ' + itemMsgLabel, 'dataArr.length', dataArr.length);

  // need for instead of forEach with async call inside of the loop
  for (let index = 0; index < dataArr.length; index++) {
    let data = dataArr[index];
    try {
      await mongoosModel.create(data);
    } catch (err) {
      logger.logAsJsonStr(
        'dataInitializer.initItems',
        'ERROR! when creating a ' + itemMsgLabel + ' at index ' + index,
        err
      );
      throw err;
    }

    logger.logAsStr(
      'dataInitializer.initItems',
      'Success! created a ' + itemMsgLabel + ' at index ' + index,
      ''
    );
  } // end of loop

  let postCount = mongoosModel.countDocuments({}); // assume this is async
  logger.logAsStr(
    'dataInitializer.initItems',
    itemMsgLabel + ' after population: Count: ',
    postCount
  );
}
