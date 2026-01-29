import React, { createContext, useState } from "react";

export const BagContext = createContext(null);

const BagContextProvider = (props) => {
  const [cart, setCart] = useState(
    Array.isArray(JSON.parse(localStorage.getItem("SHOPPING-CART")))
      ? JSON.parse(localStorage.getItem("SHOPPING-CART"))
      : []
  );

  return (
    <BagContext.Provider value={{ cart: cart, setCart: setCart }}>
      {props.children}
    </BagContext.Provider>
  );
};

export default BagContextProvider;
