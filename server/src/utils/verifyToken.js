const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("token");
  if (!token)
    return res.status(401).json({ msg: "User is unauthorized. Access denied." });

  try {
    req.user = jwt.verify(token, process.env.TOKEN_SECRET);
    next();
  } catch (err) {
    res.status(400).json({ msg: "The specified token is invalid." });
  }
};
