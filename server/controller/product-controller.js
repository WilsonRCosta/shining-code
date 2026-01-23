const router = require("express").Router();
const fs = require("fs");
const auth = require("../utils/verifyToken");
const upload = require("../utils/uploadFiles");
const productService = require("../service/product-service");
const users = require("../model/user-model.js");

router.get("/", (req, res) => {
  productService
    .getProducts()
    .then((docs) => res.status(200).json(docs))
    .catch((err) => res.status(500).json({ msg: err }));
});

router.get("/:code", (req, res) => {
  productService
    .getProductsByCode(req.params.code)
    .then((doc) => {
      doc
        ? res.status(200).json(doc)
        : res.status(404).json({ msg: `${req.params.code} does not exist.` });
    })
    .catch((err) => res.status(500).json({ msg: err }));
});

router.post("/", auth, async (req, res) => {
  if (!(await isAdmin(req.user._id)))
    return res.status(401).json({
      msg: `User ${req.user._id} is not authorized to add new products.`,
    });
  productService
    .createProduct(req.body)
    .then((doc) =>
      res.status(201).json({
        msg: `${doc.name} - [${doc.code}] was created successfully.`,
      })
    )
    .catch((err) => {
      err.code === 11000
        ? res.status(409).json({ msg: `${req.body.code} already exists.` })
        : res.status(500).json({ msg: err });
    });
});

router.put("/:code/images", upload.array("files"), auth, async (req, res) => {
  if (!(await isAdmin(req.user._id)))
    return res.status(401).json({
      msg: `User ${req.user._id} is not authorized to add images to products.`,
    });
  let offset = 0,
    filesCtr = req.files.length;
  if (!req.files) {
    return res.status(422).json({ msg: "No files have been uploaded." });
  }
  return new Promise((resolve, reject) =>
    req.files
      .map((file) => ({
        name: file.originalname,
        data: fs.readFileSync(file.path),
      }))
      .forEach((file) => {
        setTimeout(() => {
          productService
            .updateProductImage(req.body.code, file)
            .catch((err) => res.status(500).json({ msg: err }));
        }, 100 + offset);
        offset += 100;
        filesCtr--;
        if (filesCtr === 0) resolve(res.status(200).json({ msg: "All files uploaded" }));
      })
  );
});

router.put("/:code", auth, async (req, res) => {
  const admin = await isAdmin(req.user._id);
  if (!admin) {
    return res.status(401).json({
      msg: `User ${req.user._id} is not authorized to edit products.`,
    });
  }
  productService
    .updateProduct(req.params.code, req.body)
    .then((doc) => {
      return doc
        ? res.status(200).json({
            msg: `${doc.name} - [${doc.code}] was edited successfully.`,
          })
        : res.status(404).json({ msg: `${req.params.code} does not exist.` });
    })
    .catch((err) => res.status(500).json({ msg: err }));
});

router.delete("/:code", auth, async (req, res) => {
  const admin = await isAdmin(req.user._id);
  if (!admin) {
    return res.status(401).json({
      msg: `User ${req.user._id} is not authorized to delete products.`,
    });
  }
  productService
    .deleteProduct(req.params.code)
    .then((err) => {
      err.deletedCount === 0
        ? res.status(404).json({ msg: `${req.params.code} does not exist.` })
        : res.status(200).json({ msg: `[${req.params.code}] was deleted successfully.` });
    })
    .catch((err) => res.status(500).json({ msg: err }));
});

// TODO: add SHINING_ADMIN ROLE TO USERS THAT CAN BE ADMIN
const isAdmin = async (id) => {
  return users.findOne({ _id: id, email: "admin@shinningcode.com" });
};

module.exports = router;
