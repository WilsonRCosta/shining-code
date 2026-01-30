import axios from "axios";
import {
  getUserInfo as getStoredUserInfo,
  setUserInfo,
  deleteUser,
} from "./local-storage";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

const PRODUCTS_URL = "/api/products";
const USERS_URL = "/api/auth";

// --------------------
// Attach access token automatically
// --------------------
api.interceptors.request.use((config) => {
  const { token } = getStoredUserInfo();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --------------------
// Refresh-on-401 and retry
// --------------------
let isRefreshing = false;
let queue = [];

function flushQueue(newToken) {
  queue.forEach((cb) => cb(newToken));
  queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status;
    const original = err.config;

    if (status !== 401 || !original) return Promise.reject(err);

    if (original.url?.includes(`${USERS_URL}/refresh`)) {
      deleteUser();
      return Promise.reject(err);
    }

    if (original._retry) return Promise.reject(err);
    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push((newToken) => {
          if (!newToken) return reject(err);
          original.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshResp = await api.post(`${USERS_URL}/refresh`);
      const newToken = refreshResp.data?.token;
      const user = refreshResp.data?.user ?? getStoredUserInfo().user;

      if (!newToken) throw new Error("No token returned from refresh.");

      setUserInfo(user, newToken);

      isRefreshing = false;
      flushQueue(newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshErr) {
      isRefreshing = false;
      flushQueue(null);
      deleteUser();
      window.location.assign("/");
      return Promise.reject(refreshErr);
    }
  }
);

export default function clothesService() {
  return {
    // PRODUCT REQUESTS
    getProducts: (params) =>
      api.get(PRODUCTS_URL, { params }).then(getProductsInfo).catch(getError),

    getProductByCode: (code) =>
      api.get(`${PRODUCTS_URL}/${code}`).then(getProductsInfo).catch(getError),

    createProduct: (product) => {
      const { files, ...rest } = product;
      return api.post(PRODUCTS_URL, rest).then(setProductsInfo).catch(getError);
    },

    addImageToProduct: (files, colors, code) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file, file.name));
      colors.forEach((color) => formData.append("colors", color));

      return api
        .put(`${PRODUCTS_URL}/${code}/images`, formData)
        .then(getImageInfo)
        .catch(getError);
    },

    editProduct: (product) => {
      const { files, ...rest } = product;
      return api
        .put(`${PRODUCTS_URL}/${product.code}`, rest)
        .then(setProductsInfo)
        .catch(getError);
    },

    deleteProduct: (code) =>
      api.delete(`${PRODUCTS_URL}/${code}`).then(setProductsInfo).catch(getError),

    // AUTH
    loginUser: (user) =>
      api
        .post(`${USERS_URL}/login`, user)
        .then((resp) => {
          const info = mapAuthResponse(resp);
          setUserInfo(info.user, info.token);
          return info;
        })
        .catch(getError),

    registerUser: (user) =>
      api
        .post(`${USERS_URL}/register`, user)
        .then((resp) => {
          const info = mapAuthResponse(resp);
          setUserInfo(info.user, info.token);
          return info;
        })
        .catch(getError),

    logoutUser: () => api.post(`${USERS_URL}/logout`),
  };
}

const mapAuthResponse = (resp) => ({
  msg: resp.data.msg,
  token: resp.data.token,
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
