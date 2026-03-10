const express = require("express");
const { postToken } = require("../controllers/tokenController");

const router = express.Router();

router.post("/token", postToken);

module.exports = router;