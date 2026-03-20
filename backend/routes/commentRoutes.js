const express = require("express");
const router = express.Router();
const { addComment,getComments,deleteComment } = require("../controller/commentController");

const protect = require("../middleware/authMiddleware");

router.post("/:ideaId",protect,addComment);

router.get("/:ideaId",getComments);

router.delete("/:id", protect, deleteComment);

module.exports = router;