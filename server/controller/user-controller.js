const router = require("express").Router();
const User = require("../model/user-model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../utils/verifyToken");
const { registerValidation, loginValidation } = require("../utils/validation");

const signToken = (userId) => {
  if (!process.env.TOKEN_SECRET) throw new Error("TOKEN_SECRET is not set");
  return jwt.sign({ _id: userId }, process.env.TOKEN_SECRET, { expiresIn: "2h" });
};

router.post("/register", async (req, res) => {
  try {
    const { error } = registerValidation(req.body);
    if (error)
      return res.status(400).json({ type: "error", msg: error.details[0].message });

    const { name, email, password } = req.body;

    const emailExists = await User.exists({ email });
    if (emailExists) {
      return res
        .status(409)
        .json({ type: "error", msg: "The email provided already exists." });
    }

    const nameExists = await User.exists({ name });
    if (nameExists) {
      return res
        .status(409)
        .json({ type: "error", msg: "The username provided already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doc = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = signToken(doc._id);

    return res
      .header("token", token)
      .status(201)
      .json({
        type: "success",
        user: doc.name,
        msg: `User ${doc.name} created successfully!`,
      });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ type: "error", msg: "Registration failed." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { error } = loginValidation(req.body);
    if (error)
      return res.status(400).json({ type: "error", msg: error.details[0].message });

    const { name, password } = req.body;

    const user = await User.findOne({ name }).select("_id name password");
    const invalidMsg = "Username or password is incorrect.";

    if (!user) return res.status(401).json({ type: "error", msg: invalidMsg });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ type: "error", msg: invalidMsg });

    const token = signToken(user._id);

    return res
      .header("token", token)
      .status(200)
      .json({
        type: "success",
        user: user.name,
        msg: `Welcome back ${user.name}!`,
      });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ type: "error", msg: "Login failed." });
  }
});

router.delete("/", auth, async (req, res) => {
  try {
    const result = await User.deleteOne({ _id: req.user._id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ type: "error", msg: "User not found." });
    }

    return res.status(200).json({
      type: "success",
      msg: `User [${req.user._id}] was deleted successfully.`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ type: "error", msg: "Failed to delete user." });
  }
});

module.exports = router;
