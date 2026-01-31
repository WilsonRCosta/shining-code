import React from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useSnackbar } from "notistack";
import { notify } from "../../utils/notify";

export default function CheckoutForm({ amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = React.useState(false);

  const submitPayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    const { paymentIntent, error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
      },
      redirect: "if_required",
    });

    if (error) {
      notify(enqueueSnackbar, error.message, 400);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      notify(enqueueSnackbar, "Payment was successful!", 200);
      onSuccess?.(paymentIntent);
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={submitPayment} className="max-w-md mx-auto p-6">
      <PaymentElement />

      <button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full mt-6 bg-black text-white py-3 hover:bg-gray-800 disabled:bg-gray-400"
      >
        {isLoading ? "Processing..." : `Pay ${amount.toFixed(2)}€`}
      </button>
    </form>
  );
}
