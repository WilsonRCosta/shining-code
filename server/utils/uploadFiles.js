const multer = require("multer");
const fs = require("fs");
const path = require("path");

const FILE_LIMIT = 1024 * 1024 * 15; // 15MB
const FILES_DIR = path.join(__dirname, "..", "public", "images");

const allowedTypes = new Set([
  "image/png",
  "image/jpg",
  "image/gif",
  "image/jpeg",
  "image/webp",
]);

fs.mkdirSync(FILES_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, FILES_DIR);
  },
  filename: (req, file, cb) => {
    const safeName = path.basename(file.originalname).replace(/\s+/g, "_");
    cb(null, safeName);
  },
});

const uploadFile = multer({
  storage,
  limits: { fileSize: FILE_LIMIT },
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.has(file.mimetype)) {
      return cb(new Error(`File format not allowed: ${file.mimetype}`), false);
    }
    cb(null, true);
  },
});

module.exports = uploadFile;
