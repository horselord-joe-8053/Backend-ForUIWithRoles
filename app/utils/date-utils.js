const Logger = require('../utils/logger');

// jjw: https://stackoverflow.com/a/67679003
module.exports = {
  getDateWithZeroTimeFromDateOnlyStr,
  getDerivedScheduledDates,
  getScheduledDatesWithIntervalInMonth,
  getScheduledDatesWithIntervalInFornight,
  getScheduledDatesWithIntervalInFourWeeks,
  getDateIncremented,
  getDateIncrementedByDays,
  getDateIncrementedByHours,
  getDateIncrementedBySeconds,
  toISODateWithoutTimeString,
  DATE_SHIFTKEY_DELIMITER: '_',
};

// export const DateUtils = {
//   inSeconds,
//   inMinutes,
//   inHours,
//   inDays: inDaysFrac,
//   inWeeks: inWeeksFrac,
//   inMonths,
//   inYears,
// };

/*
// jjw: NOTE: we need to do comparison of the Date without the Time
// https://stackoverflow.com/a/29602313
Date.prototype.withoutTime = function () {
  // var d = new Date(this);
  // d.setHours(0, 0, 0, 0);
  // return d;

  // jjw: quite mad, but in our specific application, we never care about the time,
  // so we do this to save the cost of creating a new Date that used above
  this.setHours(0, 0, 0, 0);
  return this;
};
*/
const precision = 4;
const ignorableEpsilon = Math.pow(10, -1 * precision);

function getDateWithZeroTimeFromDateOnlyStr(dateOnlyStr) {
  return new Date(dateOnlyStr);
}

function getDerivedScheduledDates(payFrequency, lastKnowPayDateStr, anchorDateStr) {
  Logger.logAsStr(
    'DerivedValueHandler.getDerivedData',
    'lastKnowPayDate',
    lastKnowPayDateStr,
    'DEBUG'
  );
  Logger.logAsStr(
    'DerivedValueHandler.getDerivedData',
    'anchorDateStr',
    anchorDateStr
    // 'DEBUG' //TODO: recover
  );
  Logger.logAsStr('DerivedValueHandler.getDerivedData', 'payFrequency', payFrequency, 'DEBUG');

  // let secondLastDate = null;
  // let lastDate = null;
  // let nextDate = null;

  let scheduledDates = undefined;
  let anchorDate = new Date(anchorDateStr);

  // jjw: inspired by https://stackoverflow.com/a/66446126
  switch (payFrequency.toUpperCase()) {
    // jjw: case param needs to be consistent with the value in
    //    <option value="..." ...> in the config file for the payFrequency field
    case 'FORTNIGHTLY': {
      scheduledDates = getScheduledDatesWithIntervalInFornight(lastKnowPayDateStr, anchorDate);
      break;
    }
    case 'EVERY 4 WEEKS': {
      // jjw: We kept the 'value' of Option of the <SELECT/> consistent with display value
      // jjw: only because we want the summary table row shows the same as in the Add/Edit view
      // jjw: and this is the simplest and cleanest way to do it, for now.
      scheduledDates = getScheduledDatesWithIntervalInFourWeeks(lastKnowPayDateStr, anchorDate);
      break;
    }
    case 'MONTHLY': {
      scheduledDates = getScheduledDatesWithIntervalInMonth(lastKnowPayDateStr, anchorDate);
      break;
    }
    default: {
      Logger.logAsStr(
        'DerivedValueHandler',
        'getDerivedData, switch(), ERROR: unexpected payFrequency value',
        payFrequency,
        'ERROR'
      );
      break;
    }
  }

  Logger.logAsJsonStr(
    'DerivedValueHandler.getDerivedData',
    'scheduledDates',
    scheduledDates,
    'DEBUG'
  );

  return scheduledDates;
}

function getDateIncremented(baseDate, frequencyIncrementUnit, numOfIncrementUnits) {
  var resultDate = null;
  switch (frequencyIncrementUnit.toUpperCase()) {
    // jjw: case param needs to be consistent with the value in
    //    <option value="..." ...> in the config file for the payFrequency field
    case 'FORTNIGHTLY': {
      resultDate = getDateIncrementedByDays(baseDate, 14 * numOfIncrementUnits);
      break;
    }
    // TODO: later may need functionality incremented by other frequency such as 'MONTHLY'
    default: {
      Logger.logAsStr(
        'date-utils.getDateIncremented',
        'switch(), ERROR: unexpected frequencyIncrementUnit value',
        frequencyIncrementUnit,
        'ERROR'
      );
      break;
    }
  }

  return resultDate;
}

// function getDateIncrementedByDays(baseDate, days) {
//   var date = new Date(baseDate);
//   date.setDate(baseDate.getDate() + days);
//   return date;
// }

function getDateIncrementedByDays(baseDate, days) {
  // jjw: NOTE: if we need to ping the hours to be the exactly the same
  // jjw:   when we printout these Date object (which will be in UTC time),
  // jjw:   then we have to use incrememnt on 'Time' not 'Days' or 'Months'
  // jjw:   REASON: Daylight Saving Time (DST)
  // jjw:   UTC doesn't observe DST therefore
  // jjw:   - if you increment by days, it will
  // jjw:     increment to the same local time of the base date, which may have
  // jjw:     crossed DST during this increment hence, when printout to UTC, there
  // jjw:     will be discrepancy of 1h.
  // jjw:   - if you increment by Time, on the other hand, it will be incrementing
  // jjw:     UTC time which ignores DST, hence when printout as UTC time, there
  // jjw:     will be no discrepancy.
  // jjw:   Printout is a trivial issue maybe, but MongoDB is using UTC time internally
  // jjw:     so without the extra layer of logic to handle local, we need our code
  // jjw:     logic to strictly consistent with UTC to do strict comparsion between
  // jjw:     our Date and Date stored in MongoDB with timeportion strictly kept at
  // jjw:     0;
  var date = new Date(baseDate.getTime() + 24 * 3600 * 1000 * days);
  return date;
}

function getDateIncrementedByHours(baseDate, hours) {
  // jjw: NOTE as above func
  var date = new Date(baseDate.getTime() + 1000 * 60 * 60 * hours);
  return date;
}

function getDateIncrementedBySeconds(baseDate, seconds) {
  // jjw: NOTE as above func
  var date = new Date(baseDate.getTime() + 1000 * seconds);
  return date;
}

function getScheduledDatesWithIntervalInMonth(knownPrevDateStr, anchorDate) {
  var knownPrevDate = new Date(knownPrevDateStr);
  return getScheduledDatesWithIntervalInMonthWithDate(knownPrevDate, anchorDate);
}

function getScheduledDatesWithIntervalInFornight(knownPrevDateStr, anchorDate) {
  return getScheduledDatesWithIntervalInWeek(knownPrevDateStr, 2, anchorDate);
}

function getScheduledDatesWithIntervalInFourWeeks(knownPrevDateStr, anchorDate) {
  return getScheduledDatesWithIntervalInWeek(knownPrevDateStr, 4, anchorDate);
}

function getScheduledDatesWithIntervalInWeek(knownPrevDateStr, weeksPerInterval, anchorDate) {
  var knownPrevDate = new Date(knownPrevDateStr);
  return getNextScheduledDateWithIntervalInWeekWithDate(
    knownPrevDate,
    weeksPerInterval,
    anchorDate
  );
}

function getScheduledDatesWithIntervalInMonthWithDate(knownPrevDate, anchorDate) {
  // jjw: we need to clear the time portion so that the time difference between within the same day that we
  // jjw:   don't care about in this application will not affect the fraction we generate

  // knownPrevDate.setHours(0, 0, 0, 0);

  Logger.logAsJsonStr(
    'date-utils.getScheduledDatesWithIntervalInMonthWithDate',
    'knownPrevDate',
    knownPrevDate,
    'debug'
  );

  var diffInMonthInt = timeBeforeDateInMonthInt(knownPrevDate, anchorDate);
  Logger.logAsStr(
    'date-utils.getScheduledDatesWithIntervalInMonthWithDate',
    'diffInMonthInt',
    diffInMonthInt,
    'debug'
  );

  // caculate the next scheduled date
  // jjw: NOTE: https://stackoverflow.com/a/2706169
  var nextDate = new Date(knownPrevDate); // increment from knownPrevDate
  nextDate.setMonth(knownPrevDate.getMonth() + diffInMonthInt); // this may result as today's date

  // caculate the last scheduled date
  var lastDate = new Date(knownPrevDate); // increment from knownPrevDate
  lastDate.setMonth(knownPrevDate.getMonth() + diffInMonthInt - 1);
  if (lastDate < knownPrevDate) {
    // if calculated last scheduled date is still earlier than the last known date, no point to get it
    lastDate = null;
  }

  var secondLastScheduledDate = null;
  if (lastDate > knownPrevDate) {
    // if calculated last scheduled date is no later than the last known date, no point to caculate the 2nd last date
    secondLastScheduledDate = new Date(knownPrevDate);
    secondLastScheduledDate.setMonth(knownPrevDate.getMonth() + diffInMonthInt - 2);
    if (secondLastScheduledDate < knownPrevDate) {
      // if calculated 2nd last scheduled date is still earlier than the last known date, no point to get it
      secondLastScheduledDate = null;
    }
  }
  return {
    secondLastDate: secondLastScheduledDate,
    lastDate: lastDate,
    nextDate: nextDate,
  };
}

function getNextScheduledDateWithIntervalInWeekWithDate(
  knownPrevDate,
  weeksPerInterval,
  anchorDate
) {
  // jjw: we need to clear the time portion so that the time difference between within the same day that we
  // jjw:   don't care about in this application will not affect the fraction we generate
  Logger.logAsJsonStr(
    'date-utils.getNextScheduledDateWithIntervalInWeekWithDate',
    'knownPrevDate, before set hours to 0',
    knownPrevDate,
    'debug'
  );

  // knownPrevDate.setHours(0, 0, 0, 0);
  // jjw: this will not work in junction with print out the date using JSON.Stringify()
  // jjw: , which seems to use toUTCString() of the date object, not localized
  // jjw: it also seems not necessary in our context

  // jjw: TODO: read more below and find a safer way to do dates
  // jjw: https://stackoverflow.com/a/49407725 (about set hours with toString)
  // jjw: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setHours
  // jjw: TODO: question is that if setHour is set hours in local time, why when it is enabled our result
  // jjw:   is unexpected (or does it just appear so in the log? but why it appears correct without setHour
  // jjw:   in the log?
  // jjw: TODO: more reading:
  // jjw: https://stackoverflow.com/a/63166934 (Aus timezone)
  // jjw: https://stackoverflow.com/a/15171030 (more comprehensive about Date)

  Logger.logAsJsonStr(
    'date-utils.getNextScheduledDateWithIntervalInWeekWithDate',
    'knownPrevDate',
    knownPrevDate,
    'debug'
  );

  var diffInWeeksFrac = timeBeforeDateInWeeksFrac(knownPrevDate, anchorDate);
  Logger.logAsStr(
    'date-utils.getNextScheduledDateWithIntervalInWeekWithDate',
    'diffInWeeksFrac',
    diffInWeeksFrac,
    'debug'
  );
  var diffInIntervalFrac = diffInWeeksFrac / weeksPerInterval;
  diffInIntervalFrac = ignoreEpsilon(diffInIntervalFrac, ignorableEpsilon, precision);

  var diffInIntervalInt = Math.ceil(diffInIntervalFrac); // NOTE: ceil(1.000) = 1.000
  Logger.logAsStr(
    'date-utils.getNextScheduledDateWithIntervalInWeekWithDate',
    'diffInIntervalInt',
    diffInIntervalInt,
    'debug'
  );

  Logger.logAsJsonStr(
    'date-utils.getNextScheduledDateWithIntervalInWeekWithDate',
    'knownPrevDate',
    knownPrevDate,
    'debug'
  );
  // caculate the next scheduled date
  // NOTE: see note for caveat in getDateIncrementedByDays()
  // jjw: TODO:
  // 1. on server code here, replace any other
  // setDate(x.getDate() + ...) or
  // setMonth(x.getMonth() + ...)???
  // 2. on UI code, replace similar places
  var nextScheduledDate = getDateIncrementedByDays(
    knownPrevDate,
    diffInIntervalInt * weeksPerInterval * 7
  );

  Logger.logAsJsonStr(
    'date-utils.getNextScheduledDateWithIntervalInWeekWithDate',
    'nextScheduledDate',
    nextScheduledDate,
    'debug'
  );

  // caculate the last scheduled date
  var lastScheduledDate = getDateIncrementedByDays(
    knownPrevDate,
    (diffInIntervalInt - 1) * weeksPerInterval * 7
  );

  if (lastScheduledDate < knownPrevDate) {
    // if calculated last scheduled date is still earlier than the last known date, no point to get it
    lastScheduledDate = null;
  }
  Logger.logAsJsonStr(
    'date-utils.getNextScheduledDateWithIntervalInWeekWithDate',
    'lastScheduledDate',
    lastScheduledDate,
    'debug'
  );

  var secondLastScheduledDate = null;
  if (lastScheduledDate > knownPrevDate) {
    // if calculated last scheduled date is no later than the last known date, no point to caculate the 2nd last date
    secondLastScheduledDate = getDateIncrementedByDays(
      knownPrevDate,
      (diffInIntervalInt - 2) * weeksPerInterval * 7
    );

    if (secondLastScheduledDate < knownPrevDate) {
      // if calculated 2nd last scheduled date is still earlier  than the last known date, no point to get it
      secondLastScheduledDate = null;
    }
  }
  Logger.logAsJsonStr(
    'date-utils.getNextScheduledDateWithIntervalInWeekWithDate',
    'secondLastScheduledDate',
    secondLastScheduledDate,
    'debug'
  );

  return {
    secondLastDate: secondLastScheduledDate,
    lastDate: lastScheduledDate,
    nextDate: nextScheduledDate,
  };
}

function timeBeforeDateInWeeksFrac(prevDate, anchorDate) {
  var anchorDateCp = new Date(anchorDate.valueOf());
  anchorDateCp.setHours(0, 0, 0, 0);

  var diffInWeeks = inWeeksFrac(prevDate, anchorDateCp);

  return ignoreEpsilon(diffInWeeks, ignorableEpsilon, precision);
}

// function timeBeforeNowInWeeksFrac(prevDate) {
//   var now = new Date();
//   now.setHours(0, 0, 0, 0);

//   var diffInWeeks = inWeeksFrac(prevDate, now);

//   return ignoreEpsilon(diffInWeeks, ignorableEpsilon, precision);
// }

function timeBeforeDateInMonthInt(prevDate, anchorDate) {
  var anchorDateCp = new Date(anchorDate.valueOf()); // in case the original param var will be used by calling function
  anchorDateCp.setHours(0, 0, 0, 0);

  var diffInMonths = inMonths(prevDate, anchorDateCp);

  return diffInMonths;
}

// function timeBeforeNowInMonthInt(prevDate) {
//   var now = new Date();
//   now.setHours(0, 0, 0, 0);

//   var diffInMonths = inMonths(prevDate, now);

//   return diffInMonths;
// }

function ignoreEpsilon(fraction, epsilon, prec) {
  // jjw: the purpose of this function is to
  // jjw:   'smooth' the episilon resulted from fraction caculation
  // jjw:   so that these episilon will not result in 'one off' error for us
  let result = fraction;
  if (fraction - Math.floor(fraction) < epsilon) {
    result = Math.floor(fraction).toFixed(prec);
  } else if (Math.ceil(fraction) - fraction < epsilon) {
    result = Math.ceil(fraction).toFixed(prec);
  }
  return result;
}

function toISODateWithoutTimeString(date) {
  let result = '';
  if (isString(date)) {
    result = new Date(date).toISOString().split('T')[0];
  } else if (isDateObj(date)) {
    result = date.toISOString().split('T')[0];
    // result = date.toLocaleDateString();
  } else {
    Logger.logAsJsonStr(
      'date-utils.toDateString',
      'Unexpected Error: the object representing date is neither a date object or a string:',
      date
    );
  }
  return result;
}

function isString(obj) {
  // jjw: NOTE: check if it is a string: https://stackoverflow.com/a/9436948
  return typeof obj === 'string' || obj instanceof String;
}

function isDateObj(obj) {
  // jjw: NOTE: check if it is a Date object: https://stackoverflow.com/a/643827
  return Object.prototype.toString.call(obj) === '[object Date]';
}

function inSeconds(d1, d2) {
  var t2 = d2.getTime();
  var t1 = d1.getTime();

  return parseInt((t2 - t1) / 1000);
}

function inMinutes(d1, d2) {
  var t2 = d2.getTime();
  var t1 = d1.getTime();

  return parseInt((t2 - t1) / 60000);
}

function inHours(d1, d2) {
  var t2 = d2.getTime();
  var t1 = d1.getTime();

  return parseInt((t2 - t1) / 3600000);
}

function inDaysFrac(d1, d2) {
  var t2 = d2.getTime();
  var t1 = d1.getTime();

  return parseFloat((t2 - t1) / (24 * 3600 * 1000)).toFixed(precision);
}

function inWeeksFrac(d1, d2) {
  var t2 = d2.getTime();
  var t1 = d1.getTime();

  // return parseInt((t2 - t1) / (24 * 3600 * 1000 * 7));
  return parseFloat((t2 - t1) / (24 * 3600 * 1000 * 7)).toFixed(precision);
}

function inMonths(d1, d2) {
  var d1Y = d1.getFullYear();
  var d2Y = d2.getFullYear();
  var d1M = d1.getMonth();
  var d2M = d2.getMonth();

  return d2M + 12 * d2Y - (d1M + 12 * d1Y);
}

function inYears(d1, d2) {
  return d2.getFullYear() - d1.getFullYear();
}
