import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function StripeWrapper({ clientSecret, children }) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "flat",
          variables: {
            borderRadius: "0",
            colorTextSecondary: "black",
            fontFamily: "system-ui",
            fontSizeBase: "16px",
          },
        },
        loader: "always",
      }}
    >
      {children}
    </Elements>
  );
}
