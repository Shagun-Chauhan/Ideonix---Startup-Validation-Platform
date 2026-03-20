const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware")
const optionalAuth = require("../middleware/optionalAuthMiddelware")

const {createIdea,getAllIdeas , getIdeaById,updateIdea,deleteIdea, voteIdea} = require("../controller/ideaController")

router.post("/",protect,createIdea);
router.get("/",optionalAuth,getAllIdeas);
router.get("/:id",protect,getIdeaById);
router.put("/:id",protect,updateIdea);
router.delete("/:id",protect,deleteIdea);
router.post("/:id/vote",protect,voteIdea);
module.exports = router;