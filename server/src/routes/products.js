const router = require("express").Router();
const auth = require("../middlewares/verify-token");
const { customMulter } = require("../middlewares/multer-config");
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
      const docs = await productService.getProducts(req.query);
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
      const doc = await productService.createProduct({ ...req.body });
      return res.status(201).json({
        msg: `${doc.name} - [${doc.code}] was created successfully.`,
        code: doc.code,
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
  customMulter,
  asyncHandler(async (req, res) => {
    const result = await productService.addImagesToProduct(
      req.params.code,
      req.files,
      req.body.colors
    );

    return res.status(result.status).json({
      msg: result.msg,
      images: result.images,
    });
  })
);

router.put(
  "/:code",
  auth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const result = await productService.updateProductAndImages(req.params.code, {
      ...req.body,
    });
    return res.status(result.status).json({ msg: result.msg });
  })
);

router.delete(
  "/:code",
  auth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const out = await productService.deleteProductAndImages(req.params.code);
    return res.status(out.status).json({ msg: out.msg });
  })
);

module.exports = router;
