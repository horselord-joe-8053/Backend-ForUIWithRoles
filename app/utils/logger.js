
exports.logAsStr = (inFunction, objName, str) => {
  // console.log("-----TRACE----\n" + console.trace());
  // jjw: TODO: possible way to find the caller function automatically:
  // jjw:   https://stackoverflow.com/questions/57685388/is-there-a-production-safe-version-of-function-caller-in-javascript
  console.log("in " + inFunction + "(), '" + objName + "': " + str);
}
exports.logAsJsonStr = (inFunction, objName, object) => {
  // console.log("-----TRACE----\n" + console.trace());
  console.log("in " + inFunction + "(), '" + objName + "':\n" + JSON.stringify(object, null, '\t'));
}