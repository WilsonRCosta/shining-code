const jwt = require("jsonwebtoken");
const User = require("../model/user-model");
const {
  signAccessToken,
  signRefreshToken,
  hashToken,
  REFRESH_TTL,
} = require("../utils/tokens");

const issueTokensForUser = async (userDoc) => {
  const accessToken = signAccessToken(userDoc._id);
  const refreshToken = signRefreshToken(userDoc._id);

  userDoc.refreshTokens.push({
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TTL),
  });

  await userDoc.save();
  return { accessToken, refreshToken };
};

const refreshTokens = async (refreshToken) => {
  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
  } catch {
    const err = new Error("Invalid refresh token");
    err.status = 401;
    throw err;
  }

  const user = await User.findById(payload._id).select("_id name refreshTokens");
  if (!user) {
    const err = new Error("Invalid refresh token");
    err.status = 401;
    throw err;
  }

  const refreshTokenHash = hashToken(refreshToken);
  const idx = user.refreshTokens.findIndex((x) => x.tokenHash === refreshTokenHash);

  if (idx < 0) {
    user.refreshTokens = [];
    await user.save();
    const err = new Error("Refresh token not recognized");
    err.status = 401;
    err.clearAll = true;
    throw err;
  }

  user.refreshTokens.splice(idx, 1);

  const newRefreshToken = signRefreshToken(user._id);
  user.refreshTokens.push({
    tokenHash: hashToken(newRefreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TTL),
  });

  await user.save();

  const newAccessToken = signAccessToken(user._id);
  return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const logoutByRefreshToken = async (refreshToken) => {
  const payload = jwt.decode(refreshToken);
  if (!payload?._id) return;

  await User.updateOne(
    { _id: payload._id },
    { $pull: { refreshTokens: { tokenHash: hashToken(refreshToken) } } }
  );
};

module.exports = {
  issueTokensForUser,
  refreshTokens,
  logoutByRefreshToken,
};
