import { Link } from "react-router-dom";

export default function OrderConfirmation() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full border border-black/10 p-6 text-center">
        <h1 className="text-2xl font-semibold">Payment confirmed!</h1>
        <p className="mt-2 text-neutral-600">
          Your payment was successful and your order is being processed.
        </p>
        <Link to="/" className="mt-6 inline-block bg-black text-white px-5 py-3 text-sm">
          Back to shop
        </Link>
      </div>
    </div>
  );
}
