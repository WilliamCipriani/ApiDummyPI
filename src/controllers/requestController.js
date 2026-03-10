const {
  getAllRequests,
  getLatestRequest,
  getRequestById,
  clearRequests
} = require("../services/requestStore");
const { escapeHtml } = require("../utils/htmlUtils");

function getRequests(req, res) {
  const items = getAllRequests();
  res.status(200).json({
    total: items.length,
    items
  });
}

function getLatest(req, res) {
  const latest = getLatestRequest();

  if (!latest) {
    return res.status(404).json({
      status: "Not Found",
      message: "Aún no hay requests registradas"
    });
  }

  return res.status(200).json(latest);
}

function getById(req, res) {
  const item = getRequestById(req.params.id);

  if (!item) {
    return res.status(404).json({
      status: "Not Found",
      message: `No existe request con id ${req.params.id}`
    });
  }

  return res.status(200).json(item);
}

function deleteRequests(req, res) {
  clearRequests();

  return res.status(200).json({
    status: "OK",
    message: "Historial de requests limpiado"
  });
}

function getRequestsView(req, res) {
  const requests = getAllRequests();

  const rows = requests
    .slice()
    .reverse()
    .map(r => {
      return `
        <div style="border:1px solid #d0d7de; padding:14px; margin-bottom:14px; border-radius:10px; background:#fff;">
          <div><b>ID:</b> ${r.id}</div>
          <div><b>Fecha:</b> ${r.receivedAt}</div>
          <div><b>Método:</b> ${r.method}</div>
          <div><b>URL:</b> ${r.url}</div>
          <div><b>Authorization:</b> ${escapeHtml(r.authorizationPreview || "-")}</div>
          <div><b>Endpoint:</b> ${escapeHtml(r.extra?.endpointType || "-")}</div>

          <details style="margin-top:10px;" open>
            <summary><b>Resumen</b></summary>
            <pre>${escapeHtml(JSON.stringify(r.extra?.summary || {}, null, 2))}</pre>
          </details>

          <details style="margin-top:10px;">
            <summary><b>Headers</b></summary>
            <pre>${escapeHtml(JSON.stringify(r.headers, null, 2))}</pre>
          </details>

          <details style="margin-top:10px;" open>
            <summary><b>Body</b></summary>
            <pre>${escapeHtml(JSON.stringify(r.body, null, 2))}</pre>
          </details>
        </div>
      `;
    })
    .join("");

  res.send(`
    <html>
      <head>
        <title>PI Mock Requests</title>
        <meta charset="utf-8" />
      </head>
      <body style="font-family: Arial, sans-serif; background:#f6f8fa; padding:20px;">
        <h1>PI Mock - Requests recibidas</h1>
        <p><b>Total:</b> ${requests.length}</p>
        <p>
          <a href="/health">Health</a> |
          <a href="/requests/latest">Última en JSON</a> |
          <a href="/requests">Todas en JSON</a>
        </p>
        ${rows || "<p>No hay requests todavía.</p>"}
      </body>
    </html>
  `);
}

module.exports = {
  getRequests,
  getLatest,
  getById,
  deleteRequests,
  getRequestsView
};