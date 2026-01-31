import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

import NavBar from "../components/NavBar";
import { CartContext } from "../contexts/CartContext";
import { deleteFromLocalStorage, shoppingCartKey } from "../service/local-storage";
import clothesService, { resolveProductImage } from "../service/api-client";
import StripeWrapper from "../components/checkout-page/StripeWrapper";
import CheckoutForm from "../components/checkout-page/CheckoutForm";
import { useSnackbar } from "notistack";
import { notify } from "../utils/notify";

export default function ShoppingCart() {
  const { cart, setCart } = useContext(CartContext);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [showCheckout, setShowCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentMismatch, setPaymentMismatch] = useState(false);

  const total = useMemo(() => {
    if (!Array.isArray(cart)) return 0;
    return cart.reduce((sum, item) => sum + Number(item.finalPrice || 0), 0);
  }, [cart]);

  const startCheckout = async () => {
    setLoadingPayment(true);
    try {
      const res = await clothesService().createPaymentIntent(cart);
      setClientSecret(res.clientSecret);
      if (res.amountToPay === total) {
        setShowCheckout(true);
      } else {
        setPaymentMismatch(true);
        notify(enqueueSnackbar, "Invalid total amount to pay.", 400);
      }
    } catch (error) {
      notify(enqueueSnackbar, error.msg, 400);
    } finally {
      setLoadingPayment(false);
    }
  };

  const deleteItemFromCart = (item) => {
    const newCart = [...cart];
    const itemIdx = newCart.findIndex((i) => i.code === item.code);
    if (itemIdx > -1) newCart.splice(itemIdx, 1);
    setCart(newCart);
    deleteFromLocalStorage(shoppingCartKey, item.code);
  };

  const count = Array.isArray(cart) ? cart.length : 0;

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black">
            Shopping Cart
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {count === 1
              ? "Your cart contains 1 product."
              : `Your cart contains ${count} products.`}
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
                  <span className="text-lg font-semibold text-black">
                    {total.toFixed(2)}€
                  </span>
                </div>

                <p className="mt-3 text-xs text-neutral-500">
                  Shipping and taxes calculated at checkout.
                </p>

                <button
                  type="button"
                  className="mt-5 w-full py-3 text-white bg-black transition disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed"
                  onClick={startCheckout}
                  disabled={loadingPayment || total <= 0 || paymentMismatch}
                >
                  {loadingPayment ? "Preparing payment..." : "Checkout"}
                </button>

                {showCheckout && clientSecret && (
                  <StripeWrapper clientSecret={clientSecret}>
                    <CheckoutForm
                      amount={total}
                      onSuccess={() => navigate("/order-confirmation")}
                    />
                  </StripeWrapper>
                )}
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
            <h3 className="text-lg font-semibold text-black">Your cart is empty.</h3>
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
