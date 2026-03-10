const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

// Para leer JSON
app.use(express.json({ limit: "2mb" }));

// Middleware simple de log
app.use((req, res, next) => {
  console.log("======================================");
  console.log("Fecha:", new Date().toISOString());
  console.log("Método:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  next();
});

// Health check
app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "PI Mock Server",
    message: "Servidor mock activo"
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
  Puedes apuntar PI_IDENTITY_NC aquí si quieres simular autenticación real
*/
app.post("/token", (req, res) => {
  console.log("Body /token:", JSON.stringify(req.body, null, 2));

  return res.status(200).json([
    {
      scope: "Pi",
      access_token: "mock-token-123456",
      refresh_token: "mock-refresh-123456",
      validFrom: "2026-03-09T10:00:00",
      validTo: "2026-03-09T11:00:00"
    }
  ]);
});

/*
  Endpoint mock de OrdenIntervencion
  Modos de prueba:
  - ?mode=success  => 200
  - ?mode=badrequest => 400
  - ?mode=error => 500
  - sin mode => 200
*/
app.post("/api/OrdenIntervencion", (req, res) => {
  console.log("Body /api/OrdenIntervencion:");
  console.log(JSON.stringify(req.body, null, 2));

  const mode = (req.query.mode || "success").toLowerCase();

  if (mode === "badrequest") {
    return res.status(400).json({
      status: "Bad Request",
      message: "Payload inválido simulado por mock"
    });
  }

  if (mode === "error") {
    return res.status(500).json({
      status: "Internal Server Error",
      message: "Error interno simulado por mock"
    });
  }

  return res.status(200).json({
    status: "OK",
    message: "Orden simulada correctamente",
    receivedAt: new Date().toISOString(),
    receivedNumeroProceso: req.body?.numeroProceso || null,
    receivedComercioId: req.body?.comercioId || null
  });
});

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