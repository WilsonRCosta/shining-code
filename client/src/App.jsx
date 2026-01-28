import React from "react";
import { Routes, Route } from "react-router-dom";
import bg from "./images/background.png";

import Home from "./components/Home";
import Clothes from "./components/clothes-page/Clothes";
import ClothesDetails from "./components/cloth-details-page/ClothesDetails";
import Wishlist from "./components/Wishlist";
import ShoppingCart from "./components/ShoppingCart";
import Register from "./components/Register";
import AdminProducts from "./components/admin-page/AdminProducts";

import UserContextProvider from "./contexts/UserContext";
import WishlistContextProvider from "./contexts/WishlistContext";
import BagContextProvider from "./contexts/BagContext";
import { SnackbarProvider } from "notistack";

export default function App() {
  const wrapper = React.createRef();
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div ref={wrapper}>
        <SnackbarProvider
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          autoHideDuration={3000}
        >
          <UserContextProvider>
            <WishlistContextProvider>
              <BagContextProvider>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/shopping-cart" element={<ShoppingCart />} />
                  <Route path="/signin" element={<Register />} />
                  <Route path="/clothes/sales" element={<Clothes />} />
                  <Route path="/admin/products" element={<AdminProducts />} />
                  <Route path="/clothes/:genre" element={<Clothes />} />
                  <Route path="/clothes/:genre/:code" element={<ClothesDetails />} />
                </Routes>
              </BagContextProvider>
            </WishlistContextProvider>
          </UserContextProvider>
        </SnackbarProvider>
      </div>
    </div>
  );
}
