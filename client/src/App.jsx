import React from "react";
import { Route, Routes } from "react-router-dom";

import AdminProducts from "./pages/AdminProducts";
import Clothes from "./pages/Clothes";
import ClothesDetails from "./pages/ClothesDetails";
import Home from "./pages/Home";
import Register from "./pages/Register";
import ShoppingCart from "./pages/ShoppingCart";
import Wishlist from "./pages/Wishlist";

import CartContextProvider from "./contexts/CartContext";
import UserContextProvider from "./contexts/UserContext";
import WishlistContextProvider from "./contexts/WishlistContext";
import { SnackbarProvider } from "notistack";
import OrderConfirmation from "./pages/OrderConfirmation";
import Orders from "./pages/Orders";

export default function App() {
  const wrapper = React.createRef();
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url(/background.png)",
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
              <CartContextProvider>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/shopping-cart" element={<ShoppingCart />} />
                  <Route path="/order-confirmation" element={<OrderConfirmation />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/signin" element={<Register />} />
                  <Route path="/clothes/sales" element={<Clothes />} />
                  <Route path="/admin/products" element={<AdminProducts />} />
                  <Route path="/clothes/:genre" element={<Clothes />} />
                  <Route path="/clothes/:genre/:code" element={<ClothesDetails />} />
                </Routes>
              </CartContextProvider>
            </WishlistContextProvider>
          </UserContextProvider>
        </SnackbarProvider>
      </div>
    </div>
  );
}
