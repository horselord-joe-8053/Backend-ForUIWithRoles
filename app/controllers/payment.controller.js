const logger = require('../../app/utils/logger');
const DateUtils = require('../utils/date-utils');
const { resident: Resident } = require('../models');

exports.addPaidDates = async (req, res) => {
  let payload = req.body;
  logger.logAsJsonStr('payment.controller.addPaidDates', 'payload', payload);

  let newPaidDatesDict = payload;

  let updateResult = {};

  try {
    // Object.entries(shiftsToUpdate).forEach(([key, val], index) => {
    // NOTE: asynchronous iteration is another beast - await doesn't work in foreach
    //    https://stackoverflow.com/a/37576787
    // a simple for loop works
    for (const [index, [key, val]] of Object.entries(newPaidDatesDict).entries()) {
      // NOTE: need to use a plain for loop instead of foreach as we do asyn/wait call
      //  inside of each loop https://stackoverflow.com/a/45251630
      logger.logAsStr('payment.controller.addPaidDates in loop', `index: ${index}, key:${key}`, '');
      logger.logAsJsonStr('payment.controller.addPaidDates in loop', 'val', val);

      let residentId = key;
      let newPaidDateStrListForResident = val;

      // convert to list of Date to be in sync of
      // currResidentPaidDateList from the DB
      let newPaidDateListForResident = [];
      if (newPaidDateStrListForResident && newPaidDateStrListForResident.length > 0) {
        // NOTE: this is not entirely safe for all browsers, e.g. IE8
        newPaidDateListForResident = newPaidDateStrListForResident.map((str) => new Date(str));
      }

      // get the resident
      // use await ...findOne().exec() gives better stack traces
      // https://mongoosejs.com/docs/promises.html#should-you-use-exec-with-await
      let resident = await Resident.findOne({ _id: residentId }).exec();

      let currResidentPaidDateList = resident.paidDateList;
      logger.logAsJsonStr(
        'payment.controller.addPaidDates in loop',
        'currResidentPaidDateList',
        currResidentPaidDateList
      );

      let updatedResidentPaidDateList = [
        ...newPaidDateListForResident,
        ...currResidentPaidDateList,
      ];
      logger.logAsJsonStr(
        'payment.controller.addPaidDates in loop',
        'updatedResidentPaidDateList before sort',
        updatedResidentPaidDateList
      );

      // following shows error: return a.getTime() - b.getTime(); TypeError: b.getTime is not a function
      // // https://stackoverflow.com/a/18246278
      // updatedResidentPaidDateList.sort(function (a, b) {
      //   return a.getTime() - b.getTime();
      // });

      // updatedResidentPaidDateList.sort();
      // NOTE: .sort() is in-place. https://stackoverflow.com/a/46414940
      // NOTE: direct .sort() on the array of Date does not seem to work for some reason. TODO: warrant more investigation
      updatedResidentPaidDateList.sort(simpleDateSortByISOStr).reverse();
      logger.logAsJsonStr(
        'payment.controller.addPaidDates in loop',
        'updatedResidentPaidDateList after sort',
        updatedResidentPaidDateList
      );

      resident.paidDateList = updatedResidentPaidDateList;

      // https://masteringjs.io/tutorials/mongoose/update apparently save() will call updateOne() anyway
      await resident.save();
      // // https://mongoosejs.com/docs/tutorials/findoneandupdate.html
      // await Resident.updateOne({ _id: ObjectId(residentId) }, resident).exec();

      let firstName = resident['firstName'];
      let lastName = resident['lastName'];

      let newPaidDateStrList = newPaidDateStrListForResident.map((date) => {
        return DateUtils.toISODateWithoutTimeString(date);
      });

      updateResult[residentId] = {
        name: firstName + '_' + lastName,
        numAddedPaidDates: newPaidDateStrListForResident.length,
        addedPaidDates: newPaidDateStrList,
      };
    } // end of for loop

    res.status(200).send({
      updateResult: updateResult,
    });
  } catch (err) {
    res.status(500).send({ message: err });
    // throw err; // if we throw then the server will stop entirely
  } finally {
  }
};

function simpleDateSortByISOStr(dateA, dateB) {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString#:~:text=Syntax-,Date.prototype.toISOString(),denoted%20by%20the%20suffix%20Z%20.
  let isoStrA = dateA.toISOString();
  let isoStrB = dateB.toISOString();
  return isoStrA < isoStrB ? -1 : isoStrA > isoStrB ? 1 : 0;
}
