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

function buildInfoBox(label, value) {
  return `
    <div class="info-box">
      <span class="info-label">${escapeHtml(label)}</span>
      <div class="info-value">${escapeHtml(value == null || value === "" ? "-" : String(value))}</div>
    </div>
  `;
}

function buildTokenView(body) {
  if (!body) {
    return `<div class="empty-state">Sin payload de token.</div>`;
  }

  return `
    <div class="request-grid">
      ${buildInfoBox("User", body.user)}
      ${buildInfoBox("Scopes", body.scopes)}
      ${buildInfoBox("Client", body.client)}
      ${buildInfoBox("Password", body.password ? "********" : "-")}
    </div>
  `;
}

function buildOrdenIntervencionView(body) {
  if (!body) {
    return `<div class="empty-state">Sin payload de OrdenIntervencion.</div>`;
  }

  return `
    <div class="request-grid">
      ${buildInfoBox("Tipo Intervención", body.tipoIntervencionId)}
      ${buildInfoBox("Procedencia", body.procedenciaId)}
      ${buildInfoBox("Comercio ID", body.comercioId)}
      ${buildInfoBox("Comercio Nombre", body?.Comercio?.Nombre)}
      ${buildInfoBox("Estado ID", body.estadoId)}
      ${buildInfoBox("Acción ID", body.accionId)}
      ${buildInfoBox("Número Proceso", body.numeroProceso)}
      ${buildInfoBox("Número Terminal", body.numeroTerminal)}
      ${buildInfoBox("Tipo Actualización ID", body.tipoActualizacionId)}
      ${buildInfoBox("Resultado ID", body.resultadoId)}
      ${buildInfoBox("Motivo Parada ID", body.motivoParadaId)}
      ${buildInfoBox("Incidencia Indicada ID", body.incidenciaIndicadaId)}
      ${buildInfoBox("Observaciones", body.observaciones)}
      ${buildInfoBox("Provincia", body?.Comercio?.Provincia)}
      ${buildInfoBox("Población", body?.Comercio?.Poblacion)}
      ${buildInfoBox("Dirección", body?.Comercio?.Direccion)}
      ${buildInfoBox("Código Postal", body?.Comercio?.CodigoPostal)}
      ${buildInfoBox("Cif/Nif", body?.Comercio?.CifNif)}
      ${buildInfoBox("Teléfono", body?.Comercio?.Telefono1)}
    </div>
  `;
}

function buildBodyView(requestItem) {
  const endpointType = requestItem?.extra?.endpointType;
  const body = requestItem?.body;

  if (endpointType === "token") {
    return buildTokenView(body);
  }

  if (endpointType === "ordenIntervencion") {
    return buildOrdenIntervencionView(body);
  }

  if (!body) {
    return `<div class="empty-state">Sin body.</div>`;
  }

  return `
    <div class="details-block">
      <details open>
        <summary>Body</summary>
        <pre>${escapeHtml(JSON.stringify(body, null, 2))}</pre>
      </details>
    </div>
  `;
}

function getRequestsView(req, res) {
  const requests = getAllRequests();

  const rows = requests
    .slice()
    .reverse()
    .map(r => {
      return `
        <article class="request-card">
          <div class="request-header">
            <div>
              <h2 class="request-title">Request #${r.id}</h2>
              <p class="request-meta">
                <span class="endpoint-pill">${escapeHtml(r.extra?.endpointType || "-")}</span>
              </p>
            </div>

            <div class="request-meta">
              <div><b>Fecha:</b> ${escapeHtml(r.receivedAt)}</div>
              <div><b>Método:</b> ${escapeHtml(r.method)}</div>
              <div><b>URL:</b> ${escapeHtml(r.url)}</div>
            </div>
          </div>

          <div class="request-grid">
            ${buildInfoBox("Authorization", r.authorizationPreview || "-")}
            ${buildInfoBox("Número Proceso", r.extra?.summary?.numeroProceso)}
            ${buildInfoBox("Comercio ID", r.extra?.summary?.comercioId)}
            ${buildInfoBox("Comercio Nombre", r.extra?.summary?.comercioNombre)}
            ${buildInfoBox("Tipo Intervención", r.extra?.summary?.tipoIntervencionId)}
            ${buildInfoBox("Estado ID", r.extra?.summary?.estadoId)}
          </div>

          <div class="details-block">
            <details open>
              <summary>Campos enviados</summary>
              <div style="padding:14px;">
                ${buildBodyView(r)}
              </div>
            </details>
          </div>

          <div class="details-block">
            <details>
              <summary>Headers</summary>
              <pre>${escapeHtml(JSON.stringify(r.headers, null, 2))}</pre>
            </details>
          </div>
        </article>
      `;
    })
    .join("");

  res.send(`
    <html>
      <head>
        <title>PI Mock Requests</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <main class="container">
          <h1 class="page-title">PI Mock - Requests recibidas</h1>
          <p class="page-subtitle">
            Aquí puedes inspeccionar lo que Salesforce envía al backend mock.
          </p>

          <div class="toolbar">
            <span class="badge">Total: ${requests.length}</span>
            <a class="link-btn" href="/health">Health</a>
            <a class="link-btn" href="/requests/latest">Última en JSON</a>
            <a class="link-btn" href="/requests">Todas en JSON</a>
            <button class="link-btn danger-btn" onclick="clearHistory()">Limpiar historial</button>
          </div>

          ${rows || '<div class="empty-state">No hay requests todavía.</div>'}
        </main>

        <script>
          async function clearHistory() {
            const ok = confirm("¿Deseas limpiar todo el historial de requests?");
            if (!ok) return;

            try {
              const response = await fetch("/requests", {
                method: "DELETE"
              });

              if (!response.ok) {
                throw new Error("No se pudo limpiar el historial");
              }

              alert("Historial limpiado correctamente");
              window.location.reload();
            } catch (error) {
              alert("Error al limpiar historial: " + error.message);
            }
          }
        </script>
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