const db = require('../models');
const { shiftsInADay: ShiftsInADay } = db;
const logger = require('../utils/logger');
const DateUtils = require('../utils/date-utils');
const itemController = require('./item/item.controller');

exports.getShiftsInDays = async (req, res) => {
  var salaryFrequency = 'FORTNIGHTLY'; // TODO: need to get from config?
  logger.logAsJsonStr('timesheet.controller.getShiftsInDays', 'req.params', req.params);

  var lastKnownSalaryDateStr = req.params.lastKnownSalaryDateStr;
  if (!lastKnownSalaryDateStr || lastKnownSalaryDateStr.length == 0) {
    res.status(404).send({
      message:
        'ERROR: lastKnownSalaryDateStr supposed to be passed on the request via URL was absent or empty',
    });
  } else {
    logger.logAsStr(
      'timesheet.controller.getShiftsInDays',
      'lastKnownSalaryDateStr',
      lastKnownSalaryDateStr
    );

    // let scheduledDates = DateUtils.getScheduledDatesWithIntervalInFornight(lastKnownSalaryDateStr);
    let scheduledDates = DateUtils.getDerivedScheduledDates(
      salaryFrequency,
      lastKnownSalaryDateStr
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

  shiftsInADayArr = null;

  try {
    shiftsInADayArr = await ShiftsInADay.find({
      date: { $gte: fromDate, $lte: toDate },
    })
      .sort('date') // have to be sorted here so that the client end won't need to spend time doing this
      // .populate('office')
      .populate({ path: 'office', select: '_id shorthandName', options: { lean: true } })
      .populate({ path: 'pcaAm', select: '_id shorthandName', options: { lean: true } })
      .populate({ path: 'pcaPm', select: '_id shorthandName', options: { lean: true } })
      .populate({ path: 'cleaning', select: '_id shorthandName', options: { lean: true } })
      .populate({ path: 'night', select: '_id shorthandName', options: { lean: true } })

      // .populate({ path: 'pacAm', select: '_id shothandName' })
      // .populate({ path: 'pacPm', select: '_id shothandName' })
      // .populate({ path: 'cleaning', select: '_id shothandName' })
      // .populate({ path: 'night', select: '_id shothandName' })
      .lean()
      // Note:
      //  1. we need lean() here, as we need to send back not mongoose document but the plain json object;
      //  2. after lean(), the printout (JSON.Stringify()) won't show the child level json properly for
      //    some reason, but it doesn't affect anything
      .exec();
  } catch (err) {
    throw err;
  }

  // (err, shiftsInADayArr) => {
  // if (isNotEmpty(err)) {
  //   logger.logAsJsonStr('timesheet.controller.getShiftsInDays', 'err', err);
  // } else {
  if (shiftsInADayArr) {
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
    logger.logAsJsonStr(
      'timesheet.controller.getShiftsInDays',
      'ERROR: undefined or null shiftsInADayArr',
      shiftsInADayArr
    );
  }

  return shiftsInADayArr;
  // }
  // });
};

const isNotEmptyObj = (obj) => {
  return obj && obj !== undefined && Object.keys(obj).length > 0;
};
