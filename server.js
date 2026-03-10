const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

// Memoria temporal de requests recibidos
const requests = [];
let requestCounter = 1;

// Para leer JSON
app.use(express.json({ limit: "2mb" }));

// Middleware de log
app.use((req, res, next) => {
  console.log("======================================");
  console.log("Fecha:", new Date().toISOString());
  console.log("Método:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  next();
});

// Helper para guardar requests
function saveRequest(req, extra = {}) {
  const entry = {
    id: requestCounter++,
    receivedAt: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    query: req.query || {},
    headers: req.headers || {},
    body: req.body || null,
    extra
  };

  requests.push(entry);

  // Mantener solo las últimas 100 para no crecer demasiado
  if (requests.length > 100) {
    requests.shift();
  }

  return entry;
}

// Health check
app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "PI Mock Server",
    message: "Servidor mock activo",
    totalRequestsStored: requests.length
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    status: "UP"
  });
});

/*
  Endpoint mock del token
*/
app.post("/token", (req, res) => {
  const saved = saveRequest(req, { endpointType: "token" });

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
});

/*
  Endpoint mock de OrdenIntervencion
  Modos:
  - success
  - badrequest
  - error
*/
app.post("/api/OrdenIntervencion", (req, res) => {
  const saved = saveRequest(req, { endpointType: "ordenIntervencion" });

  console.log("Body /api/OrdenIntervencion:");
  console.log(JSON.stringify(req.body, null, 2));

  const mode = (req.query.mode || "success").toLowerCase();

  if (mode === "badrequest") {
    return res.status(400).json({
      status: "Bad Request",
      message: "Payload inválido simulado por mock",
      requestId: saved.id
    });
  }

  if (mode === "error") {
    return res.status(500).json({
      status: "Internal Server Error",
      message: "Error interno simulado por mock",
      requestId: saved.id
    });
  }

  return res.status(200).json({
    status: "OK",
    message: "Orden simulada correctamente",
    receivedAt: new Date().toISOString(),
    receivedNumeroProceso: req.body?.numeroProceso || null,
    receivedComercioId: req.body?.comercioId || null,
    requestId: saved.id
  });
});

/*
  Ver todas las requests guardadas
*/
app.get("/requests", (req, res) => {
  res.status(200).json({
    total: requests.length,
    items: requests
  });
});

/*
  Ver solo la última request
*/
app.get("/requests/latest", (req, res) => {
  if (requests.length === 0) {
    return res.status(404).json({
      status: "Not Found",
      message: "Aún no hay requests registradas"
    });
  }

  return res.status(200).json(requests[requests.length - 1]);
});

/*
  Ver una request por ID
*/
app.get("/requests/:id", (req, res) => {
  const id = Number(req.params.id);
  const item = requests.find(r => r.id === id);

  if (!item) {
    return res.status(404).json({
      status: "Not Found",
      message: `No existe request con id ${id}`
    });
  }

  return res.status(200).json(item);
});

/*
  Limpiar historial
*/
app.delete("/requests", (req, res) => {
  requests.length = 0;

  return res.status(200).json({
    status: "OK",
    message: "Historial de requests limpiado"
  });
});

/*
  Vista HTML simple para inspeccionar rápido en navegador
*/
app.get("/requests-view", (req, res) => {
  const rows = requests
    .slice()
    .reverse()
    .map(r => {
      return `
        <div style="border:1px solid #ccc; padding:12px; margin-bottom:12px; border-radius:8px;">
          <div><b>ID:</b> ${r.id}</div>
          <div><b>Fecha:</b> ${r.receivedAt}</div>
          <div><b>Método:</b> ${r.method}</div>
          <div><b>URL:</b> ${r.url}</div>
          <div><b>Endpoint:</b> ${r.extra?.endpointType || ""}</div>
          <details style="margin-top:8px;">
            <summary><b>Headers</b></summary>
            <pre>${escapeHtml(JSON.stringify(r.headers, null, 2))}</pre>
          </details>
          <details style="margin-top:8px;" open>
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
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>PI Mock - Requests recibidas</h1>
        <p><b>Total:</b> ${requests.length}</p>
        <p>
          <a href="/requests/latest">Ver última en JSON</a> |
          <a href="/requests">Ver todas en JSON</a>
        </p>
        ${rows || "<p>No hay requests todavía.</p>"}
      </body>
    </html>
  `);
});

// Escape simple para HTML
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// Para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    status: "Not Found",
    message: "Ruta no encontrada"
  });
});

app.listen(port, () => {
  console.log(`PI Mock Server escuchando en puerto ${port}`);
});