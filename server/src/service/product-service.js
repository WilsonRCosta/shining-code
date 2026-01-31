const products = require("../model/product-model.js");
const imageService = require("../service/image-service.js");

const getProducts = (query) => {
  const { genre, sale } = query;

  const filter = {};
  if (genre) filter.genre = genre;

  if (sale === "true") filter.discount = { $gt: 0 };

  return products.find(filter);
};

const getProductsByCode = (code) => {
  return products.findOne({ code });
};

const getProductsTotalAmount = async (cart) => {
  const foundProducts = await products.find({
    _id: { $in: cart.map((i) => i._id) },
  });

  let amount = 0;

  for (const item of cart) {
    const product = foundProducts.find((p) => p.id === item._id);
    if (!product) continue;
    const unitPrice = product.discount ? product.salesPrice : product.price;
    amount += unitPrice * item.quantity;
  }

  return amount;
};

const createProduct = (product) => {
  delete product.code;
  delete product.files;
  delete product.colors;

  if (Array.isArray(product.images)) {
    product.images = product.images.map(({ data, ...rest }) => rest);
  }

  return products.create(product);
};

const updateProductAndImages = async (code, payload) => {
  delete payload.colors;

  const existing = await products.findOne({ code });
  if (!existing) return { status: 404, msg: `${code} does not exist.` };

  let removedIds = [];
  const hasImages = Object.prototype.hasOwnProperty.call(payload, "images");
  if (hasImages) {
    const incomingImages = Array.isArray(payload.images) ? payload.images : [];

    const incomingIds = new Set(
      incomingImages
        .map((img) => (img?.fileId ? String(img.fileId) : null))
        .filter(Boolean)
    );

    removedIds = (existing.images || [])
      .map((img) => (img?.fileId ? String(img.fileId) : null))
      .filter(Boolean)
      .filter((id) => !incomingIds.has(id));
  }

  const updated = await products.findOneAndUpdate({ code }, payload, { new: true });

  updated.colors = Array.from(
    new Set((updated.images || []).map((img) => img?.color).filter(Boolean))
  );
  await updated.save();

  if (removedIds.length) {
    await imageService.deleteManyByIds(removedIds);
  }

  return {
    status: 200,
    msg: `${updated.name} - [${updated.code}] was edited successfully.`,
  };
};

const deleteProductAndImages = async (code) => {
  const doc = await products.findOne({ code });
  if (!doc) return { status: 404, msg: `${code} does not exist.` };

  const fileIds = (doc.images || []).map((img) => img.fileId).filter(Boolean);

  const { attempted, failures } = await imageService.deleteManyByIds(fileIds);

  const result = await products.deleteOne({ code });
  if (!result?.deletedCount) {
    return { status: 500, msg: `Failed to delete product ${code}.` };
  }

  const imgMsg =
    failures > 0
      ? `${failures} of ${attempted} image file(s) failed to delete from storage.`
      : `All ${attempted} images deleted from storage.`;

  return { status: 200, msg: `[${code}] deleted. ${imgMsg}` };
};

const addImagesToProduct = async (code, files, colorsRaw = []) => {
  if (!files?.length) {
    return { status: 422, msg: "No images have been uploaded." };
  }

  const doc = await products.findOne({ code });
  if (!doc) return { status: 404, msg: `${code} does not exist.` };

  const uploaded = await imageService.uploadMany(files, { code });

  const colors = Array.isArray(colorsRaw) ? colorsRaw : colorsRaw ? [colorsRaw] : [];
  const imagesToAdd = uploaded.map((u, i) => ({
    ...u,
    color: colors[i] ?? null,
  }));

  const updated = await products.findOneAndUpdate(
    { code },
    { $push: { images: { $each: imagesToAdd } } },
    { new: true }
  );

  await updateColors(updated);

  return {
    status: 200,
    msg: `All images of ${code} uploaded.`,
    images: updated.images,
    colors: updated.colors,
  };
};

const updateColors = async (doc) => {
  doc.colors = Array.from(
    new Set((doc.images || []).map((img) => img.color).filter(Boolean))
  );
  await doc.save();
  return doc;
};

module.exports = {
  getProducts,
  getProductsByCode,
  getProductsTotalAmount,
  createProduct,
  addImagesToProduct,
  updateProductAndImages,
  deleteProductAndImages,
};
