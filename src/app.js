const express = require("express");
const path = require("path");

const requestLogger = require("./middleware/requestLogger");
const healthRoutes = require("./routes/healthRoutes");
const tokenRoutes = require("./routes/tokenRoutes");
const ordenRoutes = require("./routes/ordenRoutes");
const requestRoutes = require("./routes/requestRoutes");

const app = express();

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "../public")));
app.use(requestLogger);


app.use("/", healthRoutes);
app.use("/", tokenRoutes);
app.use("/", ordenRoutes);
app.use("/", requestRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: "Not Found",
    message: "Ruta no encontrada"
  });
});

module.exports = app;