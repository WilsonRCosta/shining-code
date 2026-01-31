import React, { createContext, useState } from "react";
import { shoppingCartKey } from "../service/local-storage";

export const CartContext = createContext(null);

const CartContextProvider = ({ children }) => {
  const [cart, setCart] = useState(
    Array.isArray(JSON.parse(localStorage.getItem(shoppingCartKey)))
      ? JSON.parse(localStorage.getItem(shoppingCartKey))
      : []
  );

  return (
    <CartContext.Provider value={{ cart, setCart }}>{children}</CartContext.Provider>
  );
};

export default CartContextProvider;
