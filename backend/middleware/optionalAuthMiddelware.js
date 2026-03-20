const jwt = require("jsonwebtoken");
const User = require("../model/User");

const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

    } catch (error) {
      console.log("Invalid token (ignored)");
    }
  }

  next(); 
};

module.exports = optionalAuth;