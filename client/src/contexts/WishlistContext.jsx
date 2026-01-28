import React, { createContext, useState } from "react";

export const WishlistContext = createContext();

const WishlistContextProvider = (props) => {
  const [wishlist, setWishlist] = useState(
    Array.isArray(JSON.parse(localStorage.getItem("WISHLIST")))
      ? JSON.parse(localStorage.getItem("WISHLIST"))
      : []
  );

  return (
    <WishlistContext.Provider value={{ wishlist: wishlist, setWishlist: setWishlist }}>
      {props.children}
    </WishlistContext.Provider>
  );
};

export default WishlistContextProvider;
