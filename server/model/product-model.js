const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 },
  },
  { versionKey: false }
);

const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);

const getNextSequence = async (key) => {
  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return String(counter.seq).padStart(3, "0");
};

const productSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    index: true,
    unique: true,
    immutable: true,
  },
  name: { type: String },
  brand: { type: String },
  type: { type: String },
  genre: {
    type: String,
    enum: ["men", "women", "children"],
  },

  price: { type: Number },
  discount: { type: Number },
  salesPrice: { type: Number },

  colors: { type: Array },
  images: { type: Array },
});

productSchema.pre("validate", async function () {
  if (typeof this.code === "string" && this.code.trim() !== "") return;

  const codeGenre = this.genre?.charAt(0)?.toUpperCase() || "X";
  const codeType =
    (this.type || "").replace("-", "").substring(0, 2).toUpperCase() || "XX";

  const prefix = `${codeGenre}${codeType}`;
  const seq = await getNextSequence(prefix);

  this.code = `${prefix}-${seq}`;
});

module.exports = mongoose.model("Product", productSchema);
