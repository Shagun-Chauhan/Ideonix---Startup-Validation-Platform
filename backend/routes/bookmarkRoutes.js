const express = require("express");
const router = express.Router();

const {
  toggleBookmark,
  getBookmarks
} = require("../controller/bookmarkController");

const protect = require("../middleware/authMiddleware");

router.post("/:ideaId", protect, toggleBookmark);

router.get("/", protect, getBookmarks);

module.exports = router;