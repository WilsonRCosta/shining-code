const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const ACCESS_TTL = "15m";
const REFRESH_TTL_UNIT = "30";
const REFRESH_TTL = REFRESH_TTL_UNIT * 24 * 60 * 60 * 1000;

const signAccessToken = (userId) =>
  jwt.sign({ _id: userId }, process.env.TOKEN_SECRET, { expiresIn: ACCESS_TTL });

const signRefreshToken = (userId) =>
  jwt.sign({ _id: userId }, process.env.REFRESH_SECRET, {
    expiresIn: `${REFRESH_TTL_UNIT}d`,
  });

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/api/auth/refresh",
  maxAge: REFRESH_TTL,
});

module.exports = {
  signAccessToken,
  signRefreshToken,
  hashToken,
  refreshCookieOptions,
  REFRESH_TTL,
};
