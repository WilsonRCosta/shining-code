import React from "react";
import { Switch, Route } from "react-router-dom";
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
                <Switch>
                  <Route exact path="/" component={Home} />
                  <Route exact path="/wishlist" component={Wishlist} />
                  <Route exact path="/shopping-cart" component={ShoppingCart} />
                  <Route exact path="/signin" component={Register} />
                  <Route exact path="/clothes/sales" component={Clothes} />
                  <Route exact path="/admin/products" component={AdminProducts} />
                  <Route
                    exact
                    path="/clothes/:genre"
                    render={({ match }) => <Clothes genre={match.params.genre} />}
                  />
                  <Route
                    exact
                    path="/clothes/:genre/:code"
                    render={({ match }) => <ClothesDetails code={match.params.code} />}
                  />
                </Switch>
              </BagContextProvider>
            </WishlistContextProvider>
          </UserContextProvider>
        </SnackbarProvider>
      </div>
    </div>
  );
}
