const express = require("express");
const {
  getRequests,
  getLatest,
  getById,
  deleteRequests,
  getRequestsView
} = require("../controllers/requestController");

const router = express.Router();

router.get("/requests", getRequests);
router.get("/requests/latest", getLatest);
router.get("/requests/:id", getById);
router.delete("/requests", deleteRequests);
router.get("/requests-view", getRequestsView);

module.exports = router;