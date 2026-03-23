const express = require("express");
const router = express.Router();
const { acceptNDA } = require("../controller/ndaController");
const protect = require("../middleware/authMiddleware");

router.post("/:ideaId/accept", protect, acceptNDA);

module.exports = router;