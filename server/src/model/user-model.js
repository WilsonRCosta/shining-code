const mongoose = require("mongoose");

//TODO: ADD USER ROLE
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 6,
  },
  email: {
    type: String,
    required: true,
    max: 255,
  },
  password: {
    type: String,
    required: true,
    max: 1024,
    min: 6,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  refreshTokens: [
    {
      tokenHash: String,
      createdAt: { type: Date, default: Date.now },
      expiresAt: Date,
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
