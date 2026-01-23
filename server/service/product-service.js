const products = require("../model/product-model.js");

const getProducts = () => {
  return products.find();
};

const getProductsByCode = (code) => {
  return products.findOne({ code });
};

const createProduct = (product) => {
  return products.create(product);
};

const updateProduct = (code, product) => {
  return products.findOneAndUpdate({ code }, product, { new: true });
};

const updateProductImage = (code, file) => {
  return products.findOneAndUpdate(
    { code },
    { $set: { "images.$[elem].data": file.data } },
    {
      new: true,
      useFindAndModify: false,
      arrayFilters: [{ "elem.data": null, "elem.name": file.name }],
    }
  );
};

const deleteProduct = (code) => {
  return products.deleteOne({ code });
};

module.exports = {
  getProducts,
  getProductsByCode,
  createProduct,
  updateProduct,
  updateProductImage,
  deleteProduct,
};
