import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
});

const PRODUCTS_URL = "/api/products";
const USERS_URL = "/api/auth";

export default function clothesService() {
  return {
    // PRODUCT REQUESTS
    getProducts: (params) =>
      api.get(PRODUCTS_URL, { params }).then(getProductsInfo).catch(getError),

    getProductByCode: (code) =>
      api.get(`${PRODUCTS_URL}/${code}`).then(getProductsInfo).catch(getError),

    createProduct: (product, token) => {
      const { files, ...rest } = product;
      return api
        .post(PRODUCTS_URL, rest, { headers: { token } })
        .then(setProductsInfo)
        .catch(getError);
    },

    addImageToProduct: (files, colors, code, token) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file, file.name));
      colors.forEach((color) => formData.append("colors", color));

      return api
        .put(`${PRODUCTS_URL}/${code}/images`, formData, { headers: { token } })
        .then(getImageInfo)
        .catch(getError);
    },

    editProduct: (product, token) => {
      const { files, ...rest } = product;
      return api
        .put(`${PRODUCTS_URL}/${product.code}`, rest, { headers: { token } })
        .then(setProductsInfo)
        .catch(getError);
    },

    deleteProduct: (code, token) =>
      api
        .delete(`${PRODUCTS_URL}/${code}`, { headers: { token } })
        .then(setProductsInfo)
        .catch(getError),

    // AUTHENTICATION REQUESTS
    loginUser: (user) =>
      api.post(`${USERS_URL}/login`, user).then(getUserInfo).catch(getError),

    registerUser: (user) =>
      api.post(`${USERS_URL}/register`, user).then(getUserInfo).catch(getError),
  };
}

const getUserInfo = (resp) => ({
  msg: resp.data.msg,
  token: resp.headers.token,
  status: resp?.status ?? 500,
  user: resp.data.user,
});

const getProductsInfo = (resp) => ({
  data: resp.data,
  status: resp?.status ?? 500,
});

const setProductsInfo = (resp) => ({
  msg: resp.data.msg,
  code: resp.data.code,
  status: resp?.status ?? 500,
});

const getError = (err) => ({
  code: err?.response?.status ?? 500,
  msg: err?.response?.data?.msg ?? err.message,
  status: err?.status ?? 500,
});

const getImageInfo = (resp) => ({
  msg: resp.data.msg,
  images: resp.data.images,
  colors: resp.data.colors,
  status: resp.status,
});

export const resolveProductImage = (image) => {
  if (!image) return "/placeholder.png";

  if (image.fileId) {
    const id = image.fileId.toString?.() ?? image.fileId;
    return `${API_BASE}/api/images/${id}`;
  }

  if (image.data) {
    return image.data.startsWith("data:")
      ? image.data
      : `data:image/${image.type};base64,${image.data}`;
  }

  return "/placeholder.png";
};
