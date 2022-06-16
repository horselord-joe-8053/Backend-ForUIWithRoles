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
  // var salaryFrequency = 'FORTNIGHTLY'; // TODO: need to get from req.params?
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

const getShiftsByStartEndDatesWithBasicData = async (fromDate, toDate) => {
  logger.logAsJsonStr(
    'timesheet.controller.getShiftsByStartEndDatesWithBasicData',
    'fromDate',
    fromDate
  );
  logger.logAsJsonStr(
    'timesheet.controller.getShiftsByStartEndDatesWithBasicData',
    'toDate',
    toDate
  );

  shiftsInADayArr = [];

  try {
    shiftsInADayArr = await ShiftsInADay.find({
      date: { $gte: fromDate, $lte: toDate },
    })
      .sort('date') // have to be sorted here so that the client end won't need to spend time doing this
      .lean()
      // Note:
      //  1. we need lean() here, as we need to send back not mongoose document but the plain json object;
      //  2. after lean(), the printout (JSON.Stringify()) won't show the child level json properly for
      //    some reason, but it doesn't affect anything!!!!!
      .exec();
  } catch (err) {
    throw err;
  }

  if (shiftsInADayArr.length > 0) {
    logger.logAsJsonStr(
      'timesheet.controller.getShiftsByStartEndDatesWithBasicData',
      'shiftsInADayArr.length',
      shiftsInADayArr.length
    );
    logger.logAsJsonStr(
      'timesheet.controller.getShiftsByStartEndDatesWithBasicData',
      'shiftsInADayArr',
      shiftsInADayArr,
      'debug'
    );
  } else {
    logger.logAsJsonStr(
      'timesheet.controller.getShiftsByStartEndDatesWithBasicData',
      'WARNING: empty shiftsInADayArr',
      shiftsInADayArr,
      'Warning'
    );
  }

  return shiftsInADayArr;
};

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

exports.copyShiftsFromPreviousPeriod = async (req, res) => {
  // '/api/test/timesheet/copy/:prevPeriodStartDate/:prevPeriodEndDate/:copyToGapInDays',
  logger.logAsJsonStr(
    'timesheet.controller.copyShiftsFromPreviousPeriod',
    'req.params',
    req.params
  );

  var prevPeriodStartDateStr = req.params.prevPeriodStartDateStr;
  var prevPeriodEndDateStr = req.params.prevPeriodEndDateStr;
  var copyToGapInDays = req.params.copyToGapInDays;

  if (!prevPeriodStartDateStr || prevPeriodStartDateStr.length == 0) {
    res.status(404).send({
      message:
        'ERROR: prevPeriodStartDateStr supposed to be passed on the request via URL was absent or empty',
    });
  } else if (!prevPeriodEndDateStr || prevPeriodEndDateStr.length == 0) {
    res.status(404).send({
      message:
        'ERROR: prevPeriodEndDateStr supposed to be passed on the request via URL was absent or empty',
    });
  } else if (!copyToGapInDays || copyToGapInDays < 0) {
    res.status(404).send({
      message:
        'ERROR: positive copyToGapInDays supposed to be passed on the request via URL was absent or non-positive',
    });
  } else {
    let prevStartDate = DateUtils.getDateWithZeroTimeFromDateOnlyStr(prevPeriodStartDateStr);
    let prevEndDate = DateUtils.getDateWithZeroTimeFromDateOnlyStr(prevPeriodEndDateStr);

    // 1. get all the shifts in the previous period
    let prevPeriodShifts = await getShiftsByStartEndDatesWithBasicData(prevStartDate, prevEndDate);

    logger.logAsJsonStr(
      'tiemsheet.controller.copyShiftsFromPreviousPeriod',
      'prevPeriodShifts',
      prevPeriodShifts
    );

    logger.logAsStr(
      'tiemsheet.controller.copyShiftsFromPreviousPeriod',
      'prevPeriodShifts.length',
      prevPeriodShifts.length
    );

    // 2. copy this shifts with new dates and insert them into the DB for the next period.
    // 2.1. get the shiftsOfDay entries of the current period from DB
    let copyToPeriodStartDate = DateUtils.getDateIncrementedByDays(prevStartDate, copyToGapInDays);

    let numUpsertedDoc = 0;

    for (let i = 0; i < prevPeriodShifts.length; i++) {
      shiftsOfDay = prevPeriodShifts[i];
      // prevPeriodShifts.forEach((shiftsOfDay, index) => { // can't use forEach to contain async await
      // 2.3 remove _id and update the date to each date of the next period
      delete shiftsOfDay._id; // https://www.w3schools.com/howto/howto_js_remove_property_object.asp
      shiftsOfDay.date = DateUtils.getDateIncrementedByDays(copyToPeriodStartDate, i);

      logger.logAsJsonStr(
        'tiemsheet.controller.copyShiftsFromPreviousPeriod',
        'shiftsOfDay.date',
        shiftsOfDay.date
      );
      // 2.4 leave everything else as it is,
      //    - create new record or
      //    - override (upsert) existing record that matches with the date (because
      //      on the UI we only show this functionality for period without any shift
      //      right now, this alternative will not happen; later if we want to enable
      //      it, TODO: we need to give user an alert to confirm the override action)
      try {
        let upsertedDoc = await ShiftsInADay.findOneAndUpdate(
          { date: shiftsOfDay.date },
          shiftsOfDay,
          { new: true, upsert: true }
        );
        logger.logAsStr(
          'tiemsheet.controller.copyShiftsFromPreviousPeriod',
          'Success! created a ShiftsInADay at index ' + i,
          ''
        );
        numUpsertedDoc++;
      } catch (err) {
        logger.logAsJsonStr(
          'tiemsheet.controller.copyShiftsFromPreviousPeriod',
          'ERROR! when creating/updating a shiftUpdated at index ' + i,
          err
        );
        return res.status(500).send(err);
      } // end of catch (err) {}
      // }); // end of forEach
    } // end of for

    logger.logAsStr(
      'tiemsheet.controller.copyShiftsFromPreviousPeriod',
      'numUpsertedDoc',
      numUpsertedDoc
    );

    res.status(200).send({ numUpsertedDoc: numUpsertedDoc });
  } // end of else
};

// ========== TODO: for testing auto scheduling only
const copyWorksheetFromPreviousPeriodLite = function (currPeriodEndDate, periodLengthInWeeks) {
  logger.logAsStr(
    'tiemsheet.controller copyWorksheetFromPreviousPeriodLite function',
    `currPeriodEndDate: ${currPeriodEndDate}; periodLengthInWeeks: ${periodLengthInWeeks}`,
    ''
  );
};

// TODO: here!!
// 1. on UI: need to have a 'copy from last period' button
//    1.1 this means in the 'title' section of the period, it needs to know the 'endDate' of the last period
//      (or the 'startDate' of its own period - which entails change of argument to the following function)
//    1.2 if possible, check if the previous period has 'shifts' data to copy from
//    1.3 send an async axio 'post' request, getting tricky:
//      1.3.1 needs to trigger a refresh (of what level, the whole page???)
//      1.3.2 use spinning component to wait until the current period generated
// 2. on server side:
//    2.1 need an express to receive the 'post' request and call the following functions
//    2.2 we can still have a perpetual scheduled population. However, only do the copy work if
//      and only if the next period has not been populated yet (by action in 1 above)
const copyWorksheetFromPreviousPeriod = async function (currPeriodEndDate, periodLengthInWeeks) {
  // 1. get the start and end date of the current period based on currPeriodEndingDate
  currPeriodStartDate = DateUtils.getDateIncrementedByDays(
    currPeriodEndDate,
    -1 * (periodLengthInWeeks * 7 - 1) // from the ending date of the peroid, retract the starting date of the current period
  );

  // 2. get all the shifts in the current period
  let currPeriodShifts = await getShiftsByStartEndDatesWithBasicData(
    currPeriodStartDate,
    currPeriodEndDate
  );

  // 3. copy this shifts with new dates and insert them into the DB for the next period.
  // 3.1. get the shiftsOfDay entries of the current period from DB
  let nextPeriodStartDate = DateUtils.getDateIncrementedByDays(currPeriodEndDate, 1);
  // 3.2 check if the number of entries are as expected
  if (currPeriodShifts.length !== periodLengthInWeeks * 7) {
    logger.logAsStr(
      'tiemsheet.controller copyWorksheetFromPreviousPeriod function',
      `ERROR! currPeriodShifts we obtained from the DB suppose to 
      have ${periodLengthInWeeks * 7} entries but only have 
      ${currPeriodShifts.length}`,
      ''
    );
    return;
  }
  currPeriodShifts.forEach((shiftsOfDay, index) => {
    // 3.3 update the date to each date of the next period
    shiftsOfDay.date = DateUtils.getDateIncrementedByDays(nextPeriodStartDate, index);
    // 3.4 leave everything else as it is and copy over and insert them into DB
    ShiftsInADay.create(shiftsOfDay, (err, shiftsOfDayCreated) => {
      if (err) {
        logger.logAsJsonStr(
          'tiemsheet.controller copyWorksheetFromPreviousPeriod function',
          'ERROR! when creating a ShiftsInADay at index ' + index,
          err
        );
      } else {
        logger.logAsStr(
          'tiemsheet.controller copyWorksheetFromPreviousPeriod function',
          'Success! created a ShiftsInADay at index ' + index,
          shiftsOfDayCreated
        );
      }
    });
  });
};

// TODO here???
// 1. how to get periodEndingDate? - stored it in DB? from UI?
// 2. this 'scheduling' logic, should be run only once --
//    2.1 when to schedule it? and how to prevent it to be scheduled agian
//    2.2 if we run it everyday and check against the date, will it help? - or maybe this is the only way to 'schedule'?

// TODO here: hardcode for now, where should this be called? in server.js?
// NOTE: in fact hoursInAdvance, currPeriodEndingDate, periodLengthInWeeks can be just config
//  values instead of in DB, as we won't need to change them while server is running
//  , given that we are using recurrsion to achieve that.

// TODO here: for testing
let periodLengthInSecs = 10; // ever 10 sec do a logging
let periodLengthInWeeks = periodLengthInSecs / (60 * 60 * 24 * 7);
// autoPopulateNextPeriod(1, new Date(), 2, periodLengthInSecs); // TODO here: where to call this?

// let periodLengthInWeeks = 2;
// autoPopulateNextPeriod(1, new Date(), 2, 10);

const autoPopulateNextPeriod = (
  hoursInAdvance,
  currPeriodEndingDate,
  periodLengthInWeeks,
  numTimesScheduled
) => {
  // https://stackoverflow.com/a/19089196
  // https://stackoverflow.com/a/19088218
  // https://stackoverflow.com/questions/30074170/how-to-run-a-javascript-function-on-the-given-date-time

  currentTriggerDate = DateUtils.getDateIncrementedByHours(
    currPeriodEndingDate,
    -1 * hoursInAdvance
  );

  // TODO: only for testing
  scheduleRecurPopulation(
    currentTriggerDate,
    periodLengthInWeeks,
    copyWorksheetFromPreviousPeriodLite,
    numTimesScheduled
  );
  // scheduleRecurPopulation(currentTriggerDate, periodLengthInWeeks, realWork, numTimesScheduled);
};

// https://stackoverflow.com/a/19088202
function scheduleRecurPopulation(
  triggerDate,
  triggerIntervalInWeeks,
  realWorkfunc,
  numEventRemained
) {
  var now = new Date();

  var timeout = triggerDate.getTime() - now.getTime();

  if (timeout < 0) {
    logger.logAsStr(
      'timesheet.controller.scheduleRecurPopulation',
      `ERROR: triggerDate: "${triggerDate}" given is before the current time: "${now}", won't be scheduled`,
      ''
    );
    return;
  }

  if (timeout > 2147483647) {
    window.setTimeout(scheduleMessage(), 2147483647);
  } else {
    // window.setTimeout(function() {alert('Ho Ho Ho!'); scheduleMessage()}, timeout);
    window.setTimeout(function () {
      realWorkfunc(triggerDate, triggerIntervalInWeeks);
      nextTriggerDate = DateUtils.getDateIncrementedByDays(triggerDate, triggerIntervalInWeeks * 7); //TODO: do the correct arithmatic here
      if (numEventRemained > 0) {
        // Recursive rescheuling in 'lazy-style' - i.e. only when an trigger
        //  event occurs, it will trigger the scheduling of the next event
        // (If it was 'eager-style', recursive call wouldn't be needed.)
        scheduleRecurPopulation(
          nextTriggerDate,
          triggerIntervalInWeeks,
          realWorkfunc,
          numEventRemained - 1
        );
      }
    }, timeout);
  }
}
