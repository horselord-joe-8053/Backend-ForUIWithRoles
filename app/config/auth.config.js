module.exports = {
  // TODO: following two are not really secrets but keys for encrytion
  accessTokenSecret: "bezkoder-secret-key",
  refreshTokenSecret: "bezkoder-refresh-secret-key",
  // jwtExpiration: 3600,         // 1 hour
  // jwtRefreshExpiration: 86400, // 24 hours

  // /* for test */
  // jwtExpiration: 20,          // 5 minute
  // jwtRefreshExpiration: 1200,  // 20 minutes

  versionMismatchErrorMsg : "RefreshToken version did not match",
  loginSessionNotFoundInDBErrorMsg : "Login session is no longer found associated with the current user",

  Cookies : {
    AccessToken : 'access',
    RefreshToken : 'refresh',
  },

  TokenExpiration : {
    // jjw: 1. Token expiration option
    // jjw: use expiresIn in option for jwt.sign(...), not sure about when to use 'maxAge' option for jwt.verify(...)
    // jjw:   https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback
    // Access : 5 * 60,
    Access : 5 * 60, // TODO: to remove, test with very short lived AccessToken
    Refresh : 7 * 24 * 60 * 60,
    // RefreshIfLessThan : 4 * 24 * 60 * 60,

    // jjw: 2. Cookie property expiration options - apparently, 
    // jjw:     upon expiration by this, the property in the cookie of the browser will have a "undefined" value
    // jjw: These will be associated with the Cookies, different from above
    // jjw: https://stackoverflow.com/questions/63078402/jwt-signed-token-expiresin-not-changing-in-browser-application-even-after-change
    // jjw: https://expressjs.com/zh-cn/api.html#res.cookie
    // jjw: e.g. res.cookie(Cookies.AccessToken, access, accessTokenCookieOptions)
    // CookieAccess: 5 * 60,
    CookieAccess: 5 * 60, // TODO: to remove, test with very long lived cookie property
    CookieRefresh: 7 * 24 * 60 * 60
  
  }
};
