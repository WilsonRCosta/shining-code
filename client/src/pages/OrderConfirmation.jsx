import { Link, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import { CartContext } from "../contexts/CartContext";
import { clearLocalStorageKey, shoppingCartKey } from "../service/local-storage";
import NavBar from "../components/NavBar";
import { stripePromise } from "../components/checkout-page/StripeWrapper";

export default function OrderConfirmation() {
  const { setCart } = useContext(CartContext);
  const [searchParams] = useSearchParams();

  // checking | success | processing | pending | failed
  const [status, setStatus] = useState("checking");

  const pi = useMemo(() => {
    return (
      searchParams.get("pid") || // from manual navigation
      searchParams.get("payment_intent") // from Stripe redirect url
    );
  }, [searchParams]);

  const clientSecret = useMemo(
    () => searchParams.get("payment_intent_client_secret"), // from Stripe redirect url
    [searchParams]
  );

  const clearCart = () => {
    setCart([]);
    clearLocalStorageKey(shoppingCartKey);
  };

  useEffect(() => {
    if (!pi && !clientSecret) {
      setStatus("failed");
      return;
    }

    if (clientSecret) {
      stripePromise
        .then((stripe) => stripe.retrievePaymentIntent(clientSecret))
        .then(({ paymentIntent }) => {
          if (paymentIntent?.status === "succeeded") {
            clearCart();
            setStatus("success");
            return;
          }
          if (paymentIntent?.status === "processing") {
            setStatus("processing");
            return;
          }

          setStatus("failed");
        });
    } else if (pi) {
      // TODO: clear cart only after confirming payment with the server
      clearCart();
      setStatus("pending");
    }
  }, [pi, clientSecret, setCart]);

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mt-16 border border-black/10 p-8 text-center max-w-xl mx-auto">
          {status === "checking" && (
            <>
              <h3 className="text-lg font-semibold text-black">Checking payment…</h3>
              <p className="mt-2 text-sm text-neutral-500">Please wait a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <h3 className="text-lg font-semibold text-black">Payment confirmed!</h3>
              <p className="mt-2 text-sm text-neutral-500">
                Your order is being processed.
              </p>
            </>
          )}

          {status === "processing" && (
            <>
              <h3 className="text-lg font-semibold text-black">Payment processing</h3>
              <p className="mt-2 text-sm text-neutral-500">
                Your payment is still processing. Refresh this page in a moment.
              </p>
            </>
          )}

          {status === "pending" && (
            <>
              <h3 className="text-lg font-semibold text-black">Awaiting confirmation</h3>
              <p className="mt-2 text-sm text-neutral-500">
                Your order is awaiting for payment confirmation. Come back later.
              </p>
            </>
          )}

          {status === "failed" && (
            <>
              <h3 className="text-lg font-semibold text-black">
                We couldn’t confirm the payment
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                If you were redirected here, try refreshing. If the issue persists,
                contact support.
              </p>
            </>
          )}

          <Link
            to="/clothes/sales"
            className="mt-6 inline-flex bg-black text-white py-3 px-6 text-xs font-semibold tracking-[0.22em] uppercase hover:bg-neutral-800 transition"
          >
            Continue shopping
          </Link>

          {pi && <div className="mt-4 text-[11px] text-neutral-400">Reference: {pi}</div>}
        </div>
      </main>
    </div>
  );
}
