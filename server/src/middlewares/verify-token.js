const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token)
    return res.status(401).json({ msg: "User is unauthorized. Access denied." });

  try {
    req.user = jwt.verify(token, process.env.TOKEN_SECRET);
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        msg: `Unauthorized. Token expired at ${err.expiredAt.toLocaleTimeString()}`,
      });
    }
    console.error(err);
    res.status(400).json({ msg: "The specified token is invalid." });
  }
};
