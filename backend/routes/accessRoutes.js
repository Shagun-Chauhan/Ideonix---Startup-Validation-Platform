const express = require("express");
const router = express.Router();

const {
  requestAccess,
  getRequests,
  updateRequest
} = require("../controller/accessController");

const protect = require("../middleware/authMiddleware");

router.post("/:ideaId", protect, requestAccess);

router.get("/:ideaId", protect, getRequests);

router.put("/:id", protect, updateRequest);

module.exports = router;