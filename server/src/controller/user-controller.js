const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../model/user-model.js");
const auth = require("../middlewares/verify-token");
const { registerValidation, loginValidation } = require("../utils/validation");
const { refreshCookieOptions } = require("../utils/tokens");
const {
  issueTokensForUser,
  refreshTokens,
  logoutByRefreshToken,
} = require("../service/user-service");

router.post("/register", async (req, res) => {
  try {
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const { name, email, password } = req.body;

    if (await User.exists({ email })) {
      return res.status(409).json({ msg: "The email provided already exists." });
    }
    if (await User.exists({ name })) {
      return res.status(409).json({ msg: "The username provided already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doc = await User.create({
      name,
      email,
      password: hashedPassword,
      refreshTokens: [],
    });

    const { accessToken, refreshToken } = await issueTokensForUser(doc);

    res.cookie("refresh_token", refreshToken, refreshCookieOptions());
    return res.status(201).json({
      token: accessToken,
      user: doc.name,
      msg: `User ${doc.name} created successfully!`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Registration failed." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const { name, password } = req.body;
    const invalidMsg = "Username or password is incorrect.";

    const doc = await User.findOne({ name }).select("_id name password refreshTokens");
    if (!doc) return res.status(401).json({ msg: invalidMsg });

    const ok = await bcrypt.compare(password, doc.password);
    if (!ok) return res.status(401).json({ msg: invalidMsg });

    const { accessToken, refreshToken } = await issueTokensForUser(doc);

    res.cookie("refresh_token", refreshToken, refreshCookieOptions());
    return res.status(200).json({
      token: accessToken,
      user: doc.name,
      msg: `Welcome back ${doc.name}!`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Login failed." });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const rt = req.cookies?.refresh_token;
    if (!rt) return res.status(401).json({ msg: "Missing refresh token." });

    const { user, accessToken, refreshToken } = await refreshTokens(rt);

    res.cookie("refresh_token", refreshToken, refreshCookieOptions());
    return res.status(200).json({ token: accessToken, user: user.name });
  } catch (err) {
    console.error(err);

    res.clearCookie("refresh_token", { path: "/api/auth/refresh" });

    const status = err.status || 500;
    const msg = status === 401 ? err.message : "Refresh failed.";

    return res.status(status).json({ msg });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const rt = req.cookies?.refresh_token;
    if (rt) await logoutByRefreshToken(rt);
  } catch (err) {
    console.error(err);
  }

  res.clearCookie("refresh_token", { path: "/api/auth/refresh" });
  return res.status(200).json({ msg: "User logged out." });
});

router.delete("/", auth, async (req, res) => {
  try {
    const result = await User.deleteOne({ _id: req.user._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ msg: "User not found." });
    }
    return res
      .status(200)
      .json({ msg: `User [${req.user._id}] was deleted successfully.` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Failed to delete user." });
  }
});

module.exports = router;
