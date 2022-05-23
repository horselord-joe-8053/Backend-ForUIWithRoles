const db = require('../models');
const { shiftsInADay: ShiftsInADay } = db;
const logger = require('../utils/logger');
const DateUtils = require('../utils/date-utils');
const itemController = require('./item/item.controller');
const ShiftType = require('../models/shiftType.model');
const PaymentArrangement = require('../models/paymentArrangement.model');

exports.updateShifts = async (req, res) => {
  let shiftsToUpdate = req.body;
  // the req.body is expected to carry payload of shifts to update, like:
  // {
  //   "2022-05-09_office": "626ec19ba5fbb5558989de15",
  //   "2022-05-10_office": "626ec19ba5fbb5558989de15"
  // }

  if (!shiftsToUpdate || Object.keys(shiftsToUpdate).length == 0) {
    // https://stackoverflow.com/a/44570060
    // for (const [key, val] of Object.entries(shiftsToUpdate)){

    res
      .status(401)
      .send({ message: 'List of shift to update for update shift request is undefined or empty' });
    return;
  }

  logger.logAsJsonStr(
    'timesheet.controller.updateShifts',
    'shiftsToUpdate = req.body',
    shiftsToUpdate
  );

  logger.logAsStr(
    'timesheet.controller.updateShifts if',
    'Object.keys(shiftsToUpdate).length',
    Object.keys(shiftsToUpdate).length
  );

  let updateResultsForServerRecord = {};
  let updateResultsForClient = {};

  // Object.entries(shiftsToUpdate).forEach(([key, val], index) => {
  // NOTE: asynchronous iteration is another beast - await doesn't work in foreach
  //    https://stackoverflow.com/a/37576787
  // a simple for loop works
  for (const [index, [key, val]] of Object.entries(shiftsToUpdate).entries()) {
    // NOTE: need to use a plain for loop instead of foreach as we do asyn/wait call
    //  inside of each loop https://stackoverflow.com/a/45251630
    logger.logAsStr('timesheet.controller.updateShifts for loop', 'index', index);

    [dateWithoutTimeStr, shiftKey] = key.split(DateUtils.DATE_SHIFTKEY_DELIMITER);
    logger.logAsJsonStr(
      'timesheet.controller.updateShifts for loop',
      `[${dateWithoutTimeStr}, ${shiftKey}]`,
      // NOTE: Template Literals https://stackoverflow.com/a/28088965
      ''
    );

    // https://stackoverflow.com/a/66846878
    // query = { $expr: {$eq: [dateWithoutTimeStr, { $dateToString: {date: "$date", format: "%Y-%m-%d"}}]}}

    let inputDate = new Date(dateWithoutTimeStr);
    let result = await updateShift(shiftKey, val, inputDate);

    // NOTE: test a property exists and true
    //  https://stackoverflow.com/a/3902047

    // construct results to return to client end (simplified)
    if (result.acknowledged && result.matchedCount && result.matchedCount == 1) {
      if (result.modifiedCount == 0) {
        updateResultsForClient[key] = 'Unmodified';
      } else {
        updateResultsForClient[key] = 'Modified';
      }
    } else {
      updateResultsForClient[key] = 'Failed';
    }

    // construct aggregated results for record keep on server side (keeping the original)
    updateResultsForServerRecord[key] = result;
  } // end of for
  // }); // end of foreach

  logger.logAsJsonStr(
    'timesheet.controller.updateShifts',
    'updateResultsForClient',
    updateResultsForClient
  );
  logger.logAsJsonStr(
    'timesheet.controller.updateShifts',
    'updateResultsForServerRecord',
    updateResultsForServerRecord
  );

  res.status(200).send(updateResultsForClient);
};

const updateShift = async (shiftKey, shiftVal, inputDate) => {
  logger.logAsStr('timesheet.controller.updateShift', 'shiftKey', shiftKey);
  logger.logAsStr('timesheet.controller.updateShift', 'shiftVal', shiftVal);
  logger.logAsJsonStr('timesheet.controller.updateShift', 'inputDate', inputDate);

  let query = { date: { $eq: inputDate } };
  // NOTE: here we counted on new Date(strWithoutTime) give us inputDate with 0 hours to be consistent
  //  and comparable with the Date store in MongoDB

  // NOTE: we need the following to update only specified properties because in shiftVal
  // sometimes we have
  // {
  // 	"staff": "627e2ac617a433aab0951272",
  // 	"shiftType": "627e27ee7e8d31993119bd68"
  // },
  // sometimes we may have only
  // {
  // 	"staff": "627e2ac617a433aab095126f"
  // }
  let updateOps = {};
  for (const propKey in shiftVal) {
    updateOps[`${shiftKey}.${propKey}`] = shiftVal[propKey];
  }

  logger.logAsJsonStr('timesheet.controller.updateShift', 'updateOps', updateOps);

  try {
    // const result = await ShiftsInADay.updateOne(query, {
    //   // https://www.mongodb.com/docs/manual/reference/operator/update/set/#set-top-level-fields
    //   $set: { [shiftKey]: shiftVal }, // NOTE: need to use []
    // });

    const result = await ShiftsInADay.updateOne(query, { $set: updateOps });

    logger.logAsJsonStr('timesheet.controller.updateShift', 'result', result);

    return result;
  } catch (err) {
    throw err;
  }
};

exports.getShiftTypes = async (req, res) => {
  itemController.itemGetAll(req, res, ShiftType, 'SHIFT_TYPE');
};

// exports.getCashPayments = async (req, res) => {
//   itemController.itemGetAll(req, res, CashPayment, 'CASH_PAYMENT');
// };

// exports.getCashPayments = async (req, res) => {
//   CashPayment.find({})
//     .populate({
//       path: 'staff',
//       select: '_id shorthandName',
//       // options: { sort: [['staff.shorthandName', 'asc']] }, // NOTE: causing "Error: Invalid sort() argument, must be array of arrays" TODO: still can't find why
//       // options: { sort: { shorthandName: 'desc' } }, // NOTE: has no effect
//     })
//     // .sort({ 'staff.shorthandName': -1 }) // NOTE: has no effect
//     .lean() // jjw: NOTE: need to convert mongoose doc to a simple object https://stackoverflow.com/a/18070111
//     .exec((err, items) => {
//       if (err) {
//         res.status(500).send({ message: err });
//         return;
//       }

//       if (!items) {
//         res.status(404).send({ message: 'No ' + itemMsgLabel + ' found.' });
//         return;
//       }

//       logger.logAsJsonStr('getCashPayments', 'items:', items, 'debug');
//       res.status(200).send(items);
//     });
// };

exports.getPaymentArrangements = async (req, res) => {
  PaymentArrangement.find({})
    .populate({
      path: 'staff',
      select: '_id shorthandName',
      // options: { sort: [['staff.shorthandName', 'asc']] }, // NOTE: causing "Error: Invalid sort() argument, must be array of arrays" TODO: still can't find why
      // options: { sort: { shorthandName: 'desc' } }, // NOTE: has no effect
    })
    // .sort({ 'staff.shorthandName': -1 }) // NOTE: has no effect
    .lean() // jjw: NOTE: need to convert mongoose doc to a simple object https://stackoverflow.com/a/18070111
    .exec((err, items) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!items) {
        res.status(404).send({ message: 'No ' + itemMsgLabel + ' found.' });
        return;
      }

      logger.logAsJsonStr('getPaymentArrangments', 'items:', items, 'debug');
      res.status(200).send(items);
    });
};

exports.getShiftsInDays = async (req, res) => {
  var salaryFrequency = 'FORTNIGHTLY'; // TODO: need to get from req.params?
  logger.logAsJsonStr('timesheet.controller.getShiftsInDays', 'req.params', req.params);

  var lastKnownSalaryDateStr = req.params.lastKnownSalaryDateStr;
  var salaryFrequency = req.params.salaryFrequency;
  var anchorDateStr = req.params.anchorDateStr;

  if (!lastKnownSalaryDateStr || lastKnownSalaryDateStr.length == 0) {
    res.status(404).send({
      message:
        'ERROR: lastKnownSalaryDateStr supposed to be passed on the request via URL was absent or empty',
    });
  } else if (!salaryFrequency || salaryFrequency.length == 0) {
    res.status(404).send({
      message:
        'ERROR: salaryFrequency supposed to be passed on the request via URL was absent or empty',
    });
  } else if (!anchorDateStr || anchorDateStr.length == 0) {
    res.status(404).send({
      message:
        'ERROR: anchorDateStr supposed to be passed on the request via URL was absent or empty',
    });
  } else {
    logger.logAsStr(
      'timesheet.controller.getShiftsInDays',
      'lastKnownSalaryDateStr',
      lastKnownSalaryDateStr
    );
    logger.logAsStr('timesheet.controller.getShiftsInDays', 'salaryFrequency', salaryFrequency);
    logger.logAsStr('timesheet.controller.getShiftsInDays', 'anchorDateStr', anchorDateStr);

    // let scheduledDates = DateUtils.getScheduledDatesWithIntervalInFornight(lastKnownSalaryDateStr);
    let scheduledDates = DateUtils.getDerivedScheduledDates(
      salaryFrequency,
      lastKnownSalaryDateStr,
      anchorDateStr
    );

    logger.logAsJsonStr('timesheet.controller.getShiftsInDays', 'scheduledDates', scheduledDates);

    if (!isNotEmptyObj(scheduledDates)) {
      res.status(500).send({
        message:
          'ERROR: derived scheduledDates based on (frequency:' +
          salaryFrequency +
          ', lastKnownSalaryDateStr: ' +
          lastKnownSalaryDateStr +
          ') is empty or undefined',
      });
    } else {
      let secondLastSalaryDate = scheduledDates.secondLastDate;
      let lastSalaryDate = scheduledDates.lastDate;
      // NOTE: lastSalaryDate is different from date of lastKnownSalaryDateStr, as
      //  lastKnownSalaryDateStr can be much earlier than lastSalaryDate.
      let nextSalaryDate = scheduledDates.nextDate;
      let secondNextSalaryDate = DateUtils.getDateIncremented(nextSalaryDate, salaryFrequency, 1);
      logger.logAsJsonStr('timesheet.controller.getShiftsInDays', '[4 key dates]', [
        secondLastSalaryDate,
        lastSalaryDate,
        nextSalaryDate,
        secondNextSalaryDate,
      ]);

      let salaryPeriods = {};

      // we need to figure out three periods
      // 1. the last salary period => [secondLastSalaryDate + 1d, lastSalaryDate]
      let lastSalaryPeriodShifts = await getShiftsByStartEndDates(
        DateUtils.getDateIncrementedByDays(secondLastSalaryDate, 1),
        lastSalaryDate
      );
      salaryPeriods.lastSalaryPeriodShifts = lastSalaryPeriodShifts;

      // 2. the current salary period => [lastSalaryDate + 1d, nextSalaryDate]
      let currSalaryPeriodShifts = await getShiftsByStartEndDates(
        DateUtils.getDateIncrementedByDays(lastSalaryDate, 1),
        nextSalaryDate
      );
      salaryPeriods.currSalaryPeriodShifts = currSalaryPeriodShifts;

      // 3. the next salary period => [nextSalaryDate + 1d, secondNextSalaryDate]
      let nextSalaryPeriodShifts = await getShiftsByStartEndDates(
        DateUtils.getDateIncrementedByDays(nextSalaryDate, 1),
        secondNextSalaryDate
      );
      salaryPeriods.nextSalaryPeriodShifts = nextSalaryPeriodShifts;

      logger.logAsJsonStr('timesheet.controller.getShiftsInDays', 'salaryPeriods', salaryPeriods);

      res.status(200).send(salaryPeriods);
    }
  }
};

/*
exports.getShiftsInDaysByStartEnd = (req, res) => {
  logger.logAsJsonStr('timesheet.controller.getShiftsInDays', 'req.params', req.params);

  var fromDate;
  var fromDateStr = req.params.fromDateStr;
  if (fromDateStr && fromDateStr.length > 0) {
    logger.logAsStr('timesheet.controller.getShiftsInDays', 'fromDateStr', fromDateStr);
    fromDate = new Date(fromDateStr);
  } else {
    res
      .status(500)
      .send({ message: "Error: Missing 'fromDateStr' on request to get Timesheet data" });
    return;
  }

  var toDate;
  var toDateStr = req.params.toDateStr;
  if (toDateStr && toDateStr.length > 0) {
    logger.logAsStr('timesheet.controller.getShiftsInDays', 'toDateStr', toDateStr);
    toDate = new Date(toDateStr);
  } else {
    res
      .status(500)
      .send({ message: "Error: Missing 'toDateStr' on request to get Timesheet data" });
    return;
  }
};
*/

const getShiftsByStartEndDates = async (fromDate, toDate) => {
  logger.logAsJsonStr('timesheet.controller.getShiftsInDays', 'fromDate', fromDate);
  logger.logAsJsonStr('timesheet.controller.getShiftsInDays', 'toDate', toDate);

  // jjw: using populate() and lean() together
  // https://stackoverflow.com/a/31831107
  // https://stackoverflow.com/a/51117744

  shiftsInADayArr = [];

  try {
    shiftsInADayArr = await ShiftsInADay.find({
      date: { $gte: fromDate, $lte: toDate },
    })
      .sort('date') // have to be sorted here so that the client end won't need to spend time doing this
      // NOTE: doing multi-level for 'path' here. https://stackoverflow.com/a/62607266
      // populate 'office' shift
      .populate({
        path: 'office.staff',
        select: '_id shorthandName',
        options: { lean: true },
      })
      .populate({
        path: 'office.shiftType',
        // select: '_id uniqueReadableId isDisplayShortHand displayShortHand payMethod isInUse',
        options: { lean: true },
      })
      // populate 'pca' shift //TODO: maybe merge the path into space delimited ''
      .populate({
        path: 'pca.staff',
        select: '_id shorthandName',
        options: { lean: true },
      })
      .populate({
        path: 'pca.shiftType',
        // select: '_id uniqueReadableId isDisplayShortHand displayShortHand payMethod isInUse',
        options: { lean: true },
      })
      // populate 'cleaning' shift //TODO: maybe merge the path into space delimited ''
      .populate({
        path: 'cleaning.staff',
        select: '_id shorthandName',
        options: { lean: true },
      })
      .populate({
        path: 'cleaning.shiftType',
        // select: '_id uniqueReadableId isDisplayShortHand displayShortHand payMethod isInUse',
        options: { lean: true },
      })
      // populate 'cleaning' shift //TODO: maybe merge the path into space delimited ''
      .populate({
        path: 'night.staff',
        select: '_id shorthandName',
        options: { lean: true },
      })
      .populate({
        path: 'night.shiftType',
        // select: '_id uniqueReadableId isDisplayShortHand displayShortHand payMethod isInUse',
        options: { lean: true },
      })
      // TODO: populate the rest of shifts

      // .populate({ path: 'pcaAm', select: '_id shorthandName', options: { lean: true } })
      // .populate({ path: 'pcaPm', select: '_id shorthandName', options: { lean: true } })
      // .populate({ path: 'cleaning', select: '_id shorthandName', options: { lean: true } })
      // .populate({ path: 'night', select: '_id shorthandName', options: { lean: true } })
      .lean()
      // Note:
      //  1. we need lean() here, as we need to send back not mongoose document but the plain json object;
      //  2. after lean(), the printout (JSON.Stringify()) won't show the child level json properly for
      //    some reason, but it doesn't affect anything!!!!!
      .exec();
  } catch (err) {
    throw err;
  }

  // if (shiftsInADayArr) {
  if (shiftsInADayArr.length > 0) {
    logger.logAsJsonStr(
      'timesheet.controller.getShiftsInDays',
      'shiftsInADayArr.length',
      shiftsInADayArr.length
    );
    logger.logAsJsonStr(
      'timesheet.controller.getShiftsInDays',
      'shiftsInADayArr',
      shiftsInADayArr,
      'debug'
    );
    // itemController.handleItems(err, shiftsInADayArr, 'ShiftsInADay', res);
  } else {
    // logger.logAsJsonStr(
    //   'timesheet.controller.getShiftsInDays',
    //   'ERROR: undefined or null shiftsInADayArr',
    //   shiftsInADayArr
    // );

    logger.logAsJsonStr(
      'timesheet.controller.getShiftsInDays',
      'WARNING: empty shiftsInADayArr',
      shiftsInADayArr,
      'Warning'
    );
  }

  return shiftsInADayArr;
  // }
  // });
};

const isNotEmptyObj = (obj) => {
  return obj && obj !== undefined && Object.keys(obj).length > 0;
};
