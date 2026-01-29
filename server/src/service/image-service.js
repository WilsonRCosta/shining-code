const mongoose = require("mongoose");
const { GridFSBucket, ObjectId } = require("mongodb");
const { Readable } = require("stream");

const getBucket = () => {
  if (!mongoose.connection?.db) throw new Error("DB not connected");
  return new GridFSBucket(mongoose.connection.db, { bucketName: "images" });
};

const deleteManyByIds = async (ids) => {
  const bucket = getBucket();
  const objectIds = (ids || []).filter(Boolean).map((id) => new ObjectId(id));

  const results = await Promise.allSettled(objectIds.map((id) => bucket.delete(id)));
  const failures = results.filter((r) => r.status === "rejected").length;

  return { attempted: objectIds.length, failures };
};

const uploadMany = async (files, metadata = {}) => {
  const bucket = getBucket();

  const saved = [];
  for (const f of files) {
    const uploadStream = bucket.openUploadStream(f.originalname, {
      contentType: f.mimetype,
      metadata: { ...metadata, mime: f.mimetype },
    });

    await new Promise((resolve, reject) => {
      Readable.from(f.buffer)
        .pipe(uploadStream)
        .on("error", reject)
        .on("finish", resolve);
    });

    saved.push({
      fileId: uploadStream.id,
      name: f.originalname,
      mime: f.mimetype,
    });
  }

  return saved;
};

module.exports = { deleteManyByIds, uploadMany };
