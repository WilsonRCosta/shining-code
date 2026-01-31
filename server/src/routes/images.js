const router = require("express").Router();
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const { GridFSBucket } = require("mongodb");

const getBucket = () => {
  if (!mongoose.connection?.db) throw new Error("DB not connected");
  return new GridFSBucket(mongoose.connection.db, { bucketName: "images" });
};

router.get("/:id", async (req, res) => {
  try {
    const bucket = getBucket();
    const id = new ObjectId(req.params.id);

    const files = await bucket.find({ _id: id }).toArray();
    if (!files.length) return res.status(404).end();

    res
      .set("Content-Type", files[0].contentType || "application/octet-stream")
      .set("Cache-Control", "public, max-age=31536000, immutable");

    bucket.openDownloadStream(id).pipe(res);
  } catch (e) {
    return res.status(400).json({ msg: "Invalid image id" });
  }
});

module.exports = router;
