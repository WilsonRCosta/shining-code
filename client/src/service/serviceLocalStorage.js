const authKey = "AUTH";
const shoppingCartKey = "SHOPPING-CART";
const wishlistKey = "WISHLIST";

export const updateLocalCart = (product) => {
  let cartLocal = localStorage.getItem(shoppingCartKey);
  if (!cartLocal || JSON.parse(cartLocal).length <= 0)
    localStorage.setItem(shoppingCartKey, JSON.stringify([product]));
  else {
    let cartArray = JSON.parse(cartLocal);
    let cartProd = cartArray.find((c) => c.code === product.code);
    if (cartProd) {
      cartProd.quantity += product.quantity;
      cartProd.finalPrice = (+cartProd.finalPrice + +product.finalPrice).toFixed(2);
    } else cartArray.push(product);
    localStorage.setItem(shoppingCartKey, JSON.stringify(cartArray));
  }
};

export const updateLocalWishlist = (item) => {
  let wishlistStore = localStorage.getItem(wishlistKey);
  if (!wishlistStore || JSON.parse(wishlistStore).length <= 0) {
    localStorage.setItem(wishlistKey, JSON.stringify([item]));
  } else {
    let wishArray = JSON.parse(wishlistStore);
    const objIdx = wishArray.findIndex((w) => w.code === item.code);
    objIdx > -1 ? wishArray.splice(objIdx, 1) : wishArray.push(item);
    localStorage.setItem(wishlistKey, JSON.stringify(wishArray));
  }
};

export const deleteFromLocalStorage = (src, code) => {
  let key = "";
  switch (src) {
    case "wish": {
      key = wishlistKey;
      break;
    }
    case "cart": {
      key = shoppingCartKey;
      break;
    }
    default:
      throw new Error("Error! Unknown source to perform delete action.");
  }
  let localCart = JSON.parse(localStorage.getItem(key));
  const localItemIdx = localCart.findIndex((i) => i.code === code);
  localCart.splice(localItemIdx, 1);
  localStorage.setItem(key, JSON.stringify(localCart));
};

export const setUserInfo = (user, token) => {
  localStorage.setItem(authKey, JSON.stringify({ user, token }));
};

export const getUserInfo = () => {
  try {
    const raw = localStorage.getItem(authKey);
    return raw ? JSON.parse(raw) : { user: "", token: "" };
  } catch {
    return { user: "", token: "" };
  }
};
export const deleteUser = () => {
  try {
    localStorage.removeItem(authKey);
  } catch {}
};
