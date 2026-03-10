const { getAllRequests } = require("../services/requestStore");

function home(req, res) {
  res.json({
    ok: true,
    service: "PI Mock Server",
    message: "Servidor mock activo",
    totalRequestsStored: getAllRequests().length
  });
}

function health(req, res) {
  res.status(200).json({
    ok: true,
    status: "UP",
    totalRequestsStored: getAllRequests().length
  });
}

module.exports = {
  home,
  health
};