const logger = "INFO"; // jjw: this value we can adjust

const defaultLogLevel = "INFO"; // jjw: we can adjust 'logLevel' to hide all default printout

const levelMap = {
  "DEBUG" : 1,
  "INFO" : 2,
  "WARNING" : 3,
  "ERROR" : 4
}

logToConsole = (logStr, level) => {
  let userLevel = level? level : defaultLogLevel;

  let userLevelVal = levelMap[userLevel.toUpperCase()];
  let minLevelVal = levelMap[logger.toUpperCase()];

  if (userLevelVal >= minLevelVal) {
    // console.log("-----TRACE----\n" + console.trace());
    // jjw: TODO: possible way to find the caller function automatically:
    // jjw:   https://stackoverflow.com/questions/57685388/is-there-a-production-safe-version-of-function-caller-in-javascript
    console.log(logStr);
  }
}

exports.logAsStr = (inFunction, objName, info, level) => {
  logToConsole("in " + inFunction + "(), '" + objName + "': " + info, level)
}

exports.logAsJsonStr = (inFunction, objName, object, level) => {
  logToConsole("in " + inFunction + "(), '" + objName + "':\n" + JSON.stringify(object, null, '\t'), level);
}

/*
exports.logAsStr = (inFunction, objName, info, level) => {

  let userLevel = level? level : defaultLogLevel;

  let userLevelVal = levelMap[userLevel.toUpperCase()];
  let minLevelVal = levelMap[minLogLevel.toUpperCase()];

  if (userLevelVal >= minLevelVal) {
    // console.log("-----TRACE----\n" + console.trace());
    // jjw: TODO: possible way to find the caller function automatically:
    // jjw:   https://stackoverflow.com/questions/57685388/is-there-a-production-safe-version-of-function-caller-in-javascript
    console.log("in " + inFunction + "(), '" + objName + "': " + info);
  }
}
exports.logAsJsonStr = (inFunction, objName, object) => {
  // console.log("-----TRACE----\n" + console.trace());
  console.log("in " + inFunction + "(), '" + objName + "':\n" + JSON.stringify(object, null, '\t'));
}
*/