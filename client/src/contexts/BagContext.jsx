import React, { createContext, useState } from "react";
import { shoppingCartKey } from "../service/local-storage";

export const BagContext = createContext(null);

const BagContextProvider = ({ children }) => {
  const [cart, setCart] = useState(
    Array.isArray(JSON.parse(localStorage.getItem(shoppingCartKey)))
      ? JSON.parse(localStorage.getItem(shoppingCartKey))
      : []
  );
  const [total, setTotal] = useState(0);

  return (
    <BagContext.Provider value={{ cart, setCart, total, setTotal }}>
      {children}
    </BagContext.Provider>
  );
};

export default BagContextProvider;
