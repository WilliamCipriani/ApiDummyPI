const { saveRequest } = require("../services/requestStore");

function postToken(req, res) {
  const saved = saveRequest(req, {
    endpointType: "token"
  });

  console.log("Body /token:");
  console.log(JSON.stringify(req.body, null, 2));

  return res.status(200).json([
    {
      scope: "Pi",
      access_token: "mock-token-123456",
      refresh_token: "mock-refresh-123456",
      validFrom: "2026-03-09T10:00:00",
      validTo: "2026-03-09T11:00:00",
      requestId: saved.id
    }
  ]);
}

module.exports = { postToken };