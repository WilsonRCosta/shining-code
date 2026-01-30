import { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

import NavBar from "./NavBar";
import { BagContext } from "../contexts/BagContext";
import { deleteFromLocalStorage } from "../service/local-storage";
import { notify } from "../utils/notify";
import { useSnackbar } from "notistack";
import { resolveProductImage } from "../service/api-client";

export default function ShoppingCart() {
  const { cart, setCart } = useContext(BagContext);
  const { enqueueSnackbar } = useSnackbar();

  const total = useMemo(() => {
    if (!Array.isArray(cart)) return "0.00";
    return cart
      .reduce((sum, item) => sum + parseFloat(item.finalPrice || 0), 0)
      .toFixed(2);
  }, [cart]);

  const deleteItemFromCart = (item) => {
    const newCart = [...cart];
    const itemIdx = newCart.findIndex((i) => i.code === item.code);
    if (itemIdx > -1) newCart.splice(itemIdx, 1);
    setCart(newCart);
    deleteFromLocalStorage("cart", item.code);
  };

  const count = Array.isArray(cart) ? cart.length : 0;

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black">
            Shopping Bag
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {count === 1
              ? "Your bag contains 1 product."
              : `Your bag contains ${count} products.`}
          </p>
        </header>

        {count > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <section className="lg:col-span-2">
              {/* Desktop table header */}
              <div className="hidden md:grid grid-cols-[120px_1fr_90px_110px_110px_48px] gap-4 border-b border-black/10 pb-3 text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600">
                <div>Item</div>
                <div>Details</div>
                <div className="text-right">Qty</div>
                <div className="text-right">Price</div>
                <div className="text-right">Subtotal</div>
                <div />
              </div>

              <div className="divide-y divide-black/10">
                {cart.map((item) => {
                  const img = item.images?.find((x) => x.fileId) || item.images?.[0];
                  const unitPrice = item.discount ? item.salesPrice : item.price;

                  return (
                    <div
                      key={`${item.code}-${item.size}-${item.quantity}`}
                      className="py-5"
                    >
                      {/* Desktop row */}
                      <div className="hidden md:grid grid-cols-[120px_1fr_90px_110px_110px_48px] gap-4 items-center">
                        <div className="bg-neutral-100 overflow-hidden">
                          <img
                            src={resolveProductImage(img)}
                            alt={item.name}
                            className="h-28 w-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        <div>
                          <Link
                            to={`/clothes/${item.genre}/${item.code}`}
                            className="text-sm font-semibold text-black hover:text-neutral-500 transition"
                          >
                            {item.name}
                          </Link>

                          <div className="mt-1 text-xs text-neutral-600">
                            <span className="font-semibold tracking-wide">SIZE:</span>{" "}
                            {item.size}
                          </div>

                          <div className="mt-1 text-[11px] text-neutral-400">
                            Code: {item.code}
                          </div>
                        </div>

                        <div className="text-right text-sm">{item.quantity}</div>

                        <div className="text-right text-sm">
                          {Number(unitPrice).toFixed(2)}€
                        </div>

                        <div className="text-right text-sm font-semibold">
                          {Number(item.finalPrice).toFixed(2)}€
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteItemFromCart(item)}
                          className="h-10 w-10 inline-flex items-center justify-center border border-black/10 hover:border-black/30 transition"
                          aria-label="Remove item"
                        >
                          <FaTrash className="text-black" />
                        </button>
                      </div>

                      {/* Mobile card */}
                      <div className="md:hidden flex gap-4">
                        <div className="w-28 bg-neutral-100 overflow-hidden shrink-0">
                          <img
                            src={resolveProductImage(img)}
                            alt={item.name}
                            className="h-28 w-28 object-cover"
                            loading="lazy"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <Link
                              to={`/clothes/${item.genre}/${item.code}`}
                              className="text-sm font-semibold text-black hover:text-neutral-500 transition"
                            >
                              {item.name}
                            </Link>

                            <button
                              type="button"
                              onClick={() => deleteItemFromCart(item)}
                              className="h-9 w-9 inline-flex items-center justify-center border border-black/10 hover:border-black/30 transition"
                              aria-label="Remove item"
                            >
                              <FaTrash />
                            </button>
                          </div>

                          <div className="mt-2 text-xs text-neutral-600">
                            <div>
                              <span className="font-semibold tracking-wide">SIZE:</span>{" "}
                              {item.size}
                            </div>
                            <div className="mt-1">
                              <span className="font-semibold tracking-wide">QTY:</span>{" "}
                              {item.quantity}
                            </div>
                          </div>

                          <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="text-neutral-500">
                              {Number(unitPrice).toFixed(2)}€ each
                            </span>
                            <span className="font-semibold text-black">
                              {Number(item.finalPrice).toFixed(2)}€
                            </span>
                          </div>

                          <div className="mt-2 text-[11px] text-neutral-400">
                            Code: {item.code}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Summary */}
            <aside className="lg:col-span-1">
              <div className="border border-black/10 p-5 sticky top-24">
                <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600">
                  Summary
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Total</span>
                  <span className="text-lg font-semibold text-black">{total}€</span>
                </div>

                <p className="mt-3 text-xs text-neutral-500">
                  Shipping and taxes calculated at checkout.
                </p>

                <button
                  type="button"
                  className="mt-5 w-full bg-black text-white py-3 text-xs font-semibold tracking-[0.22em] uppercase hover:bg-neutral-800 transition"
                  onClick={() =>
                    notify(enqueueSnackbar, "Checkout not implemented yet.", 400)
                  }
                >
                  Checkout
                </button>

                <Link
                  to="/clothes/sales"
                  className="mt-3 block text-center text-xs font-semibold tracking-[0.18em] uppercase text-neutral-600 hover:text-black"
                >
                  Continue shopping
                </Link>
              </div>
            </aside>
          </div>
        ) : (
          <div className="mt-16 border border-black/10 p-8 text-center max-w-xl mx-auto">
            <h3 className="text-lg font-semibold text-black">Your bag is empty.</h3>
            <p className="mt-2 text-sm text-neutral-500">
              Explore our store and add something you love.
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
