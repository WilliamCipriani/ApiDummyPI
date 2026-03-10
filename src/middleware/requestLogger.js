const { nowIso } = require("../utils/helpers");
const { safeAuthHeader } = require("../utils/auth");

module.exports = function requestLogger(req, res, next) {
  console.log("======================================");
  console.log("Fecha:", nowIso());
  console.log("Método:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Authorization:", safeAuthHeader(req.headers));
  next();
};