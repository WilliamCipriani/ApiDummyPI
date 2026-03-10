const express = require("express");
const { home, health } = require("../controllers/healthController");

const router = express.Router();

router.get("/", home);
router.get("/health", health);

module.exports = router;