const router = require("express").Router();
const User = require("../model/user-model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../utils/verifyToken");
const { registerValidation, loginValidation } = require("../utils/validation");

router.post("/register", async (req, res) => {
    try {
        const { error } = registerValidation(req.body);
        if (error) return res.status(400).json({ msg: error.details[0].message });

        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
            return res.status(400).json({ msg: "The email provided already exists." });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const doc = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        });

        const token = jwt.sign({ _id: doc._id }, process.env.TOKEN_SECRET);

        return res.header("token", token).status(200).json({
            user: doc.name,
            msg: `User ${doc.name} created successfully!`,
            token,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ msg: err?.message || "Registration failed" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { error } = loginValidation(req.body);
        if (error) return res.status(400).json({ msg: error.details[0].message });

        const user = await User.findOne({ name: req.body.name });
        if (!user) {
            return res.status(401).json({ msg: "Username or password is incorrect." });
        }

        const ok = await bcrypt.compare(req.body.password, user.password);
        if (!ok) {
            return res.status(401).json({ msg: "Username or password is incorrect." });
        }

        const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
            expiresIn: "7d",
        });

        return res
            .header("token", token)
            .status(200)
            .json({
                user: user.name,
                token,
                msg: `Welcome back ${user.name}!`,
            });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Login failed." });
    }
});

router.delete("/:id", auth, async (req, res) => {
    try {
        const result = await User.deleteOne({ _id: req.user._id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ msg: "User not found." });
        }

        return res.status(200).json({ msg: `User [${req.user._id}] was deleted successfully.` });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: `Failed to delete user [${req.user._id}].` });
    }
});

module.exports = router;
