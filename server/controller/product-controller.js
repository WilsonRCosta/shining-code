const router = require("express").Router();
const fs = require("fs/promises");
const auth = require("../utils/verifyToken");
const upload = require("../utils/uploadFiles");
const productService = require("../service/product-service");
const users = require("../model/user-model.js");

// -------- helpers --------

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// TODO: replace with real roles/permissions in DB
const isAdmin = async (id) => {
  // Prefer: return Boolean(user?.role === 'admin')
  const user = await users.findOne({ _id: id }).select("_id email role isAdmin");
  return Boolean(user?.email === "admin@shinningcode.com");
};

const requireAdmin = asyncHandler(async (req, res, next) => {
  const ok = await isAdmin(req.user._id);
  if (!ok) {
    return res.status(403).json({
      msg: `User ${req.user._id} is not authorized to perform this action.`,
    });
  }
  next();
});

// -------- routes --------

router.get(
  "/",
  asyncHandler(async (req, res) => {
    try {
      const { genre, sale } = req.query;

      const docs = await productService.getProducts({
        genre,
        sale: sale === "true",
      });

      return res.status(200).json(docs);
    } catch (err) {
      console.error("GET /api/products failed:", err);
      return res.status(500).json({ msg: err?.message || "Failed to fetch products" });
    }
  })
);

router.get(
  "/:code",
  asyncHandler(async (req, res) => {
    const code = req?.params?.code;
    try {
      const doc = await productService.getProductsByCode(code);
      if (!doc) {
        return res.status(404).json({ msg: `${code} does not exist.` });
      }
      res.status(200).json(doc);
    } catch (err) {
      console.error("GET /api/products/:code failed:", err);
      return res
        .status(500)
        .json({ msg: err?.message || `Failed to fetch product ${code}` });
    }
  })
);

router.post(
  "/",
  auth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    try {
      const doc = await productService.createProduct(req.body);
      return res.status(201).json({
        msg: `${doc.name} - [${doc.code}] was created successfully.`,
      });
    } catch (err) {
      if (err?.code === 11000) {
        return res.status(409).json({ msg: `${req.body.code} already exists.` });
      }
      throw err;
    }
  })
);

router.put(
  "/:code/images",
  auth,
  requireAdmin,
  upload.array("files", 5),
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(422).json({ msg: "No files have been uploaded." });
    }

    const code = req.params.code;

    const filePayloads = await Promise.all(
      req.files.map(async (f) => {
        const data = await fs.readFile(f.path);
        return { name: f.originalname, data, path: f.path };
      })
    );

    await Promise.all(
      filePayloads.map((file) => productService.updateProductImage(code, file))
    );

    await Promise.allSettled(filePayloads.map((f) => fs.unlink(f.path)));

    res.status(200).json({ msg: "All files uploaded" });
  })
);

router.put(
  "/:code",
  auth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const doc = await productService.updateProduct(req.params.code, req.body);
    if (!doc) return res.status(404).json({ msg: `${req.params.code} does not exist.` });

    res.status(200).json({
      msg: `${doc.name} - [${doc.code}] was edited successfully.`,
    });
  })
);

router.delete(
  "/:code",
  auth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const result = await productService.deleteProduct(req.params.code);
    if (!result || result.deletedCount === 0) {
      return res.status(404).json({ msg: `${req.params.code} does not exist.` });
    }
    res.status(200).json({ msg: `[${req.params.code}] was deleted successfully.` });
  })
);

module.exports = router;
