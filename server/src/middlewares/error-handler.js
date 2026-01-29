const { TOTAL_FILES_SIZE_LIMIT, FILES_LIMIT } = require("./multer-config");
const multer = require("multer");

module.exports = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(413).json({
          msg: `Images too large (max is ${TOTAL_FILES_SIZE_LIMIT / 1024 / 1024}MBs).`,
        });

      case "LIMIT_FILE_COUNT":
        return res.status(400).json({ msg: `Too many images (max is ${FILES_LIMIT}).` });

      default:
        return res.status(400).json({ msg: err.message });
    }
  }

  console.error(err);

  res.status(500).json({ msg: "Internal server error" });
};
