const multer = require("multer");

const TOTAL_FILES_SIZE_LIMIT = 15 * 1024 * 1024; // 15MB
const FILES_LIMIT = 5;

const allowedTypes = new Set([
  "image/png",
  "image/jpg",
  "image/gif",
  "image/jpeg",
  "image/webp",
]);

const customMulter = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: TOTAL_FILES_SIZE_LIMIT,
    files: FILES_LIMIT,
  },
  fileFilter: (req, file, next) => {
    if (!allowedTypes.has(file.mimetype)) {
      return next(new Error(`File format not allowed: ${file.mimetype}`));
    }
    next(null, true);
  },
}).array("files", FILES_LIMIT);

module.exports = {
  customMulter,
  TOTAL_FILES_SIZE_LIMIT,
  FILES_LIMIT,
};
