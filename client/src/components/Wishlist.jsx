import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaTrash } from "react-icons/fa";

import NavBar from "./NavBar";
import { WishlistContext } from "../contexts/WishlistContext";
import { BagContext } from "../contexts/BagContext";
import { updateLocalCart, deleteFromLocalStorage } from "../service/serviceLocalStorage";

export default function Wishlist() {
  const { wishlist, setWishlist } = useContext(WishlistContext);
  const { cart, setCart } = useContext(BagContext);

  const count = Array.isArray(wishlist) ? wishlist.length : 0;

  const totalLabel = useMemo(() => {
    if (count === 1) return "FAVORITE";
    return "FAVORITES";
  }, [count]);

  const handleAddToCartClick = (product) => {
    // IMPORTANT: avoid mutating the original wishlist item reference
    const itemToAdd = {
      ...product,
      size: product.size || "M",
      quantity: 1,
    };

    const unit = itemToAdd.discount ? itemToAdd.salesPrice : itemToAdd.price;
    itemToAdd.finalPrice = parseFloat(unit).toFixed(2);

    updateLocalCart(itemToAdd);

    const newCart = [...cart];
    const existing = newCart.find(
      (c) => c.code === itemToAdd.code && c.size === itemToAdd.size
    );

    if (existing) {
      existing.quantity += 1;
      existing.finalPrice = (+existing.finalPrice + +itemToAdd.finalPrice).toFixed(2);
    } else {
      newCart.push(itemToAdd);
    }

    setCart(newCart);
  };

  const handleDeleteFromWishlist = (item) => {
    const newWishlist = wishlist.filter((w) => w.code !== item.code);
    setWishlist(newWishlist);
    deleteFromLocalStorage("wish", item.code);
  };

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black">
              Wishlist
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Save items you love and add them to your bag anytime.
            </p>
          </div>

          <div className="text-right">
            <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600">
              YOU HAVE
            </div>
            <div className="mt-1 text-3xl font-semibold text-black">{count}</div>
            <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600">
              {totalLabel}
            </div>
          </div>
        </header>

        {count > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((wishItem) => {
              const img = wishItem.images?.[0];
              const unitPrice = wishItem.discount ? wishItem.salesPrice : wishItem.price;

              return (
                <div key={wishItem.code} className="group">
                  <Link
                    to={`/clothes/${wishItem.genre}/${wishItem.code}`}
                    className="block"
                  >
                    <div className="relative bg-neutral-100 overflow-hidden">
                      <img
                        src={`data:image/${img?.type};base64,${img?.data}`}
                        alt={wishItem.name}
                        className="h-80 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                      />

                      {wishItem.discount ? (
                        <div className="absolute top-3 left-3 bg-black text-white text-xs px-2 py-1 tracking-wide">
                          SALE
                        </div>
                      ) : null}
                    </div>

                    <div className="pt-3">
                      <p className="text-sm font-semibold text-black line-clamp-1">
                        {wishItem.name}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500 line-clamp-1">
                        {wishItem.brand}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        {wishItem.discount ? (
                          <>
                            <span className="text-sm text-neutral-400 line-through">
                              {Number(wishItem.price).toFixed(2)}€
                            </span>
                            <span className="text-sm font-semibold text-black">
                              {Number(wishItem.salesPrice).toFixed(2)}€
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-semibold text-black">
                            {Number(unitPrice).toFixed(2)}€
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCartClick(wishItem)}
                      className="flex-1 bg-black text-white py-3 text-xs font-semibold tracking-[0.22em] uppercase hover:bg-neutral-800 transition inline-flex items-center justify-center gap-2"
                    >
                      <FaShoppingCart />
                      Add to bag
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteFromWishlist(wishItem)}
                      className="h-11 w-11 inline-flex items-center justify-center border border-black/10 hover:border-black/30 transition"
                      aria-label="Remove from wishlist"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-16 border border-black/10 p-8 text-center max-w-xl mx-auto">
            <h3 className="text-lg font-semibold text-black">Your wishlist is empty.</h3>
            <p className="mt-2 text-sm text-neutral-500">
              Browse the store and save your favorites here.
            </p>
            <Link
              to="/clothes/sales"
              className="mt-6 inline-flex bg-black text-white py-3 px-6 text-xs font-semibold tracking-[0.22em] uppercase hover:bg-neutral-800 transition"
            >
              Shop sale
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
