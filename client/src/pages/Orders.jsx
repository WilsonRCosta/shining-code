import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";

export default function Orders() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black">
            Orders
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            This page is still in development.
          </p>
        </header>

        <div className="mt-16 border border-black/10 p-8 text-center max-w-xl mx-auto">
          <h3 className="text-lg font-semibold text-black">Coming soon...</h3>
          <p className="mt-2 text-sm text-neutral-500">
            You’ll be able to view your order history here.
          </p>

          <Link
            to="/clothes/sales"
            className="mt-6 inline-flex bg-black text-white py-3 px-6 text-xs font-semibold tracking-[0.22em] uppercase hover:bg-neutral-800 transition"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    </div>
  );
}
