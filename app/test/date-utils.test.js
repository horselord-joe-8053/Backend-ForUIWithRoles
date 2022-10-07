const Logger = require('../utils/logger');

const DateUtils = require('../utils/date-utils');
const { forEach } = require('lodash');

test('Date Sort', () => {
  let dateListBeforeSort = [
    '2022-10-05T00:00:00.000Z',
    '2022-09-07T00:00:00.000Z',
    '2022-08-10T00:00:00.000Z',
    '2022-07-13T00:00:00.000Z',
    '2022-07-27T00:00:00.000Z',
    '2022-09-21T00:00:00.000Z',
  ];

  let expectedAscDateListAfterSort = [
    '2022-07-13T00:00:00.000Z',
    '2022-07-27T00:00:00.000Z',
    '2022-08-10T00:00:00.000Z',
    '2022-09-07T00:00:00.000Z',
    '2022-09-21T00:00:00.000Z',
    '2022-10-05T00:00:00.000Z',
  ];

  let expectedDescDateListAfterSort = [
    '2022-10-05T00:00:00.000Z',
    '2022-09-21T00:00:00.000Z',
    '2022-09-07T00:00:00.000Z',
    '2022-08-10T00:00:00.000Z',
    '2022-07-27T00:00:00.000Z',
    '2022-07-13T00:00:00.000Z',
  ];

  dateListBeforeSort.sort(isoDateStrSort);

  expect(dateListBeforeSort).toEqual(expectedAscDateListAfterSort);
  expect(dateListBeforeSort.reverse()).toEqual(expectedDescDateListAfterSort);
});

function isoDateStrSort(a, b) {
  let aDate = new Date(a);
  let bDate = new Date(b);
  return aDate < bDate ? -1 : aDate > bDate ? 1 : 0;
}

test('DateUtils.getPrevScheduledDateList, FORTNIGHTLY, 2022-03-01 to 2022-04-01', () => {
  // getScheduledDateListWithIntervalInWeeks(knownPrevDate, weeksPerInterval, anchorDate)
  let lastKnownPayDateStr = '2022-03-01';
  let anchorDateStr = '2022-04-01';
  let frequency = 'FORTNIGHTLY';

  let expectedDateStrList = ['2022-03-01', '2022-03-15', '2022-03-29'];

  let expectedResult = getDateObjList(expectedDateStrList);

  // // unordered
  // expect(DateUtils.getPrevScheduledDateList(frequency, lastKnownPayDateStr, anchorDateStr)).toEqual(
  //   expect.arrayContaining(expectedResult)
  // );

  // ordered
  expect(DateUtils.getPrevScheduledDateList(frequency, lastKnownPayDateStr, anchorDateStr)).toEqual(
    expectedResult
  );
});

test('DateUtils.getPrevScheduledDateList, FORTNIGHTLY, 2022-03-01 to 2022-03-27', () => {
  // getScheduledDateListWithIntervalInWeeks(knownPrevDate, weeksPerInterval, anchorDate)
  let lastKnownPayDateStr = '2022-03-01';
  let anchorDateStr = '2022-03-27';
  let frequency = 'FORTNIGHTLY';

  let expectedDateStrList = ['2022-03-01', '2022-03-15'];

  let expectedResult = getDateObjList(expectedDateStrList);

  // // unordered
  // expect(DateUtils.getPrevScheduledDateList(frequency, lastKnownPayDateStr, anchorDateStr)).toEqual(
  //   expect.arrayContaining(expectedResult)
  // );

  // ordered
  expect(DateUtils.getPrevScheduledDateList(frequency, lastKnownPayDateStr, anchorDateStr)).toEqual(
    expectedResult
  );
});

test('DateUtils.getPrevScheduledDateList, FORTNIGHTLY, 2022-03-01 to 2022-03-29, edgecase', () => {
  // getScheduledDateListWithIntervalInWeeks(knownPrevDate, weeksPerInterval, anchorDate)
  let lastKnownPayDateStr = '2022-03-01';
  let anchorDateStr = '2022-03-29';
  let frequency = 'FORTNIGHTLY';

  let expectedResult = getDateObjList(['2022-03-01', '2022-03-15', '2022-03-29']);

  expect(DateUtils.getPrevScheduledDateList(frequency, lastKnownPayDateStr, anchorDateStr)).toEqual(
    expectedResult
  );
});

// Monthly
test('DateUtils.getPrevScheduledDateList, MONTHLY, 2021-03-01 to 2021-06-29', () => {
  // getScheduledDateListWithIntervalInWeeks(knownPrevDate, weeksPerInterval, anchorDate)
  let lastKnownPayDateStr = '2022-03-01';
  let anchorDateStr = '2022-06-29';
  let frequency = 'MONTHLY';

  let expectedDateStrList = ['2022-03-01', '2022-04-01', '2022-05-01', '2022-06-01'];
  let expectedResult = getDateObjList(expectedDateStrList);

  expect(DateUtils.getPrevScheduledDateList(frequency, lastKnownPayDateStr, anchorDateStr)).toEqual(
    expectedResult
  );
});

test('DateUtils.getPrevScheduledDateList, MONTHLY, 2022-03-01 to 2022-06-01, edgecase', () => {
  // getScheduledDateListWithIntervalInWeeks(knownPrevDate, weeksPerInterval, anchorDate)
  let lastKnownPayDateStr = '2022-03-01';
  let anchorDateStr = '2022-06-01';
  let frequency = 'MONTHLY';

  let expectedDateStrList = ['2022-03-01', '2022-04-01', '2022-05-01', '2022-06-01'];
  let expectedResult = getDateObjList(expectedDateStrList);

  expect(DateUtils.getPrevScheduledDateList(frequency, lastKnownPayDateStr, anchorDateStr)).toEqual(
    expectedResult
  );
});

test('DateUtils.getPrevScheduledDateList, MONTHLY, 2022-01-31 to 2022-02-28, edgecase', () => {
  // getScheduledDateListWithIntervalInWeeks(knownPrevDate, weeksPerInterval, anchorDate)
  let lastKnownPayDateStr = '2022-01-31';
  let anchorDateStr = '2022-02-28';
  let frequency = 'MONTHLY';

  let expectedDateStrList = ['2022-01-31', '2022-02-28'];
  let expectedResult = getDateObjList(expectedDateStrList);

  expect(DateUtils.getPrevScheduledDateList(frequency, lastKnownPayDateStr, anchorDateStr)).toEqual(
    expectedResult
  );
});

test('DateUtils Random, FORTNIGHTLY, David Wheeler, Last Known Pay Date: 2021-11-19', () => {
  // getScheduledDateListWithIntervalInWeeks(knownPrevDate, weeksPerInterval, anchorDate)
  let lastKnownPayDateStr = '2021-11-19';
  let anchorDateStr = '2022-07-20';
  let frequency = 'FORTNIGHTLY';

  let scheduledDates = DateUtils.getDerivedScheduledDates(
    frequency,
    lastKnownPayDateStr,
    anchorDateStr
  );

  Logger.logAsJsonStr('test', '----scheduledDates', scheduledDates);
});

function getDateObjList(expectedDateStrList) {
  // let result = [];

  // forEach() is an 'in order' function
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#description
  // expectedDateStrList.forEach((str) => {
  //   result.push(new Date(str));
  // });

  // map() is an 'in order' function
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map#description
  let result = expectedDateStrList.map((str) => new Date(str));

  return result;
}
