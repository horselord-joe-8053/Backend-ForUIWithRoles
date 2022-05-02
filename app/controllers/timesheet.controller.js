const db = require('../models');
const { shiftsInADay: ShiftsInADay } = db;
const logger = require('../utils/logger');
const itemController = require('./item/item.controller');

exports.getShiftsInDays = (req, res) => {
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

  logger.logAsJsonStr('timesheet.controller.getShiftsInDays', 'fromDate', fromDate);
  logger.logAsJsonStr('timesheet.controller.getShiftsInDays', 'toDate', toDate);

  // jjw: using populate() and lean() together
  // https://stackoverflow.com/a/31831107
  // https://stackoverflow.com/a/51117744

  ShiftsInADay.find({
    date: { $gte: fromDate, $lte: toDate },
  })
    .sort('date') // have to be sorted here so that the client end won't need to spend time doing this
    // .populate('office')
    .populate({ path: 'office', select: '_id shorthandName', options: { lean: true } })
    // .populate({ path: 'pacAm', select: '_id shothandName' })
    // .populate({ path: 'pacPm', select: '_id shothandName' })
    // .populate({ path: 'cleaning', select: '_id shothandName' })
    // .populate({ path: 'night', select: '_id shothandName' })
    .lean()
    // Note:
    //  1. we need lean() here, as we need to send back not mongoose document but the plain json object;
    //  2. after lean(), the printout (JSON.Stringify()) won't show the child level json properly for
    //    some reason, but it doesn't affect anything
    .exec((err, shiftsInADayArr) => {
      if (isNotEmpty(err)) {
        logger.logAsJsonStr('timesheet.controller.getShiftsInDays', 'err', err);
      } else {
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
          itemController.handleItems(err, shiftsInADayArr, 'ShiftsInADay', res);
        } else {
          logger.logAsJsonStr(
            'timesheet.controller.getShiftsInDays',
            'undefined shiftsInADayArr',
            shiftsInADayArr
          );
        }
      }
    });

  /*
  ShiftsInADay.find({
    date: { $gte: fromDate, $lte: toDate },
  })
    .sort('date')
    .exec(itemController.handleItems(err, shiftsInADayArr, 'ShiftsInADay', res));
  */
};

const isNotEmpty = (obj) => {
  return obj && obj !== undefined && Object.keys(obj).length > 0;
};
