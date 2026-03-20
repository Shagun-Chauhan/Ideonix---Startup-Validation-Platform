const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware")

const {registerUser , loginUser} = require("../controller/authController");

router.post("/register",registerUser);
router.post("/login",loginUser);

router.get("/protected",protect,(req,res)=>{
    res.json({
        message: "Access granted ✅",
        userId: req.user
      });
})
module.exports = router;