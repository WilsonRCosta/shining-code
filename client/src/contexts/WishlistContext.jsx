import React, { createContext, useState } from "react";
import { wishlistKey } from "../service/local-storage";

export const WishlistContext = createContext(null);

const WishlistContextProvider = (props) => {
  const [wishlist, setWishlist] = useState(
    Array.isArray(JSON.parse(localStorage.getItem(wishlistKey)))
      ? JSON.parse(localStorage.getItem(wishlistKey))
      : []
  );

  return (
    <WishlistContext.Provider value={{ wishlist: wishlist, setWishlist: setWishlist }}>
      {props.children}
    </WishlistContext.Provider>
  );
};

export default WishlistContextProvider;
