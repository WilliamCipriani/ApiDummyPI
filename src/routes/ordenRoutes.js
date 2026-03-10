const express = require("express");
const { postOrdenIntervencion } = require("../controllers/ordenController");

const router = express.Router();

router.post("/api/OrdenIntervencion", postOrdenIntervencion);

module.exports = router;