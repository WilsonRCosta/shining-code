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
    getProducts: () => api.get(PRODUCTS_URL).then(getProductsInfo).catch(getError),

    getProductByCode: (code) =>
      api.get(`${PRODUCTS_URL}/${code}`).then(getProductsInfo).catch(getError),

    createProduct: (product, token) => {
      const { files, ...rest } = product; // remove files
      return api
        .post(PRODUCTS_URL, rest, { headers: { token } })
        .then(setProductsInfo)
        .catch(getError);
    },

    addImageToProduct: (files, code, token) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file, file.name));

      return api
        .put(`${PRODUCTS_URL}/${code}/images`, formData, {
          headers: { token },
        })
        .then(setProductsInfo)
        .catch(getError);
    },

    editProduct: (product, token) =>
      api
        .put(`${PRODUCTS_URL}/${product.code}`, product, { headers: { token } })
        .then(setProductsInfo)
        .catch(getError),

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
  status: resp?.status ?? 500,
});

const getError = (err) => ({
  code: err?.response?.status ?? 500,
  msg: err?.response?.data?.msg ?? err.message,
  status: err?.status ?? 500,
});
