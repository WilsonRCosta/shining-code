const authKey = "AUTH";
const shoppingCartKey = "SHOPPING-CART";
const wishlistKey = "WISHLIST";

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const updateLocalCart = (product) => {
  const cart = readJSON(shoppingCartKey, []);

  const idx = cart.findIndex((c) => c.code === product.code);
  if (idx >= 0) {
    const existing = cart[idx];
    existing.quantity += product.quantity;
    existing.finalPrice = (+existing.finalPrice + +product.finalPrice).toFixed(2);
  } else {
    cart.push(product);
  }

  writeJSON(shoppingCartKey, cart);
};

export const updateLocalWishlist = (item) => {
  const wishlist = readJSON(wishlistKey, []);

  const idx = wishlist.findIndex((w) => w.code === item.code);
  if (idx >= 0) wishlist.splice(idx, 1);
  else wishlist.push(item);

  writeJSON(wishlistKey, wishlist);
};

export const deleteFromLocalStorage = (src, code) => {
  const key = src === "wish" ? wishlistKey : src === "cart" ? shoppingCartKey : null;

  if (!key) throw new Error("Error! Unknown source to perform delete action.");

  const arr = readJSON(key, []);
  const idx = arr.findIndex((i) => i.code === code);
  if (idx >= 0) arr.splice(idx, 1);

  writeJSON(key, arr);
};

export const setUserInfo = (user, token) => {
  writeJSON(authKey, { user, token });
};

export const getUserInfo = () => {
  return readJSON(authKey, { user: "", token: "" });
};

export const deleteUser = () => {
  try {
    localStorage.removeItem(authKey);
  } catch {}
};
