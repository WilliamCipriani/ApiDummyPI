const { saveRequest } = require("../services/requestStore");
const { buildSummaryFromBody, nowIso } = require("../utils/helpers");

function postOrdenIntervencion(req, res) {
  const summary = buildSummaryFromBody(req.body);

  const saved = saveRequest(req, {
    endpointType: "ordenIntervencion",
    summary
  });

  console.log("Body /api/OrdenIntervencion:");
  console.log(JSON.stringify(req.body, null, 2));

  const mode = (req.query.mode || "success").toLowerCase();

  if (mode === "badrequest") {
    return res.status(400).json({
      status: "Bad Request",
      message: "Payload inválido simulado por mock",
      requestId: saved.id,
      receivedNumeroProceso: summary.numeroProceso
    });
  }

  if (mode === "error") {
    return res.status(500).json({
      status: "Internal Server Error",
      message: "Error interno simulado por mock",
      requestId: saved.id,
      receivedNumeroProceso: summary.numeroProceso
    });
  }

  return res.status(200).json({
    status: "OK",
    message: "Orden simulada correctamente",
    requestId: saved.id,
    receivedAt: nowIso(),
    receivedNumeroProceso: summary.numeroProceso,
    receivedComercioId: summary.comercioId
  });
}

module.exports = { postOrdenIntervencion };