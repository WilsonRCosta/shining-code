import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaHeart, FaShoppingCart } from "react-icons/fa";

import { WishlistContext } from "../contexts/WishlistContext";
import { CartContext } from "../contexts/CartContext";
import { UserContext } from "../contexts/UserContext";
import clothesService from "../service/api-client";

const navLinkClass =
  "px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-neutral-900 hover:text-neutral-500 transition";

const navLinkActive = "text-neutral-400";

export default function NavBar() {
  const { wishlist } = useContext(WishlistContext);
  const { cart } = useContext(CartContext);
  const { userProvider, clearContext, isAdmin } = useContext(UserContext);
  const [user] = userProvider;

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const cartCount = useMemo(() => (Array.isArray(cart) ? cart.length : 0), [cart]);
  const wishCount = useMemo(
    () => (Array.isArray(wishlist) ? wishlist.length : 0),
    [wishlist]
  );

  const handleLogout = (e) => {
    e.preventDefault();
    clearContext();
    clothesService().logoutUser();
  };

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 ${scrolled ? "bg-white/90 backdrop-blur border-b border-black/10" : "bg-white border-b border-black/5"}`}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="h-[72px] flex items-center justify-between gap-3">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 min-w-[180px]">
            <img
              src="/logo.png"
              alt="Shining Code"
              className="h-12 w-12 object-contain"
            />
            <span className="text-sm font-extrabold tracking-[-0.02em] text-neutral-900">
              SHINING CODE
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center">
            <NavLink
              to="/clothes/sales"
              className={({ isActive }) =>
                isActive ? `${navLinkClass} ${navLinkActive}` : navLinkClass
              }
            >
              Sales
            </NavLink>
            <NavLink
              to="/clothes/men"
              className={({ isActive }) =>
                isActive ? `${navLinkClass} ${navLinkActive}` : navLinkClass
              }
            >
              Men
            </NavLink>
            <NavLink
              to="/clothes/women"
              className={({ isActive }) =>
                isActive ? `${navLinkClass} ${navLinkActive}` : navLinkClass
              }
            >
              Women
            </NavLink>
            <NavLink
              to="/clothes/children"
              className={({ isActive }) =>
                isActive ? `${navLinkClass} ${navLinkActive}` : navLinkClass
              }
            >
              Children
            </NavLink>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {!user ? (
              <NavLink
                to="/signin"
                className="hidden md:inline-flex px-4 py-2 text-xs font-semibold tracking-[0.18em] uppercase bg-black text-white hover:bg-neutral-800 transition"
              >
                Sign in
              </NavLink>
            ) : (
              <>
                {isAdmin && (
                  <NavLink
                    to="/admin/products"
                    className="hidden md:inline-flex px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-neutral-900 hover:text-neutral-500 transition"
                  >
                    Admin
                  </NavLink>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden md:inline-flex px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-neutral-500 hover:text-black transition"
                >
                  Logout
                </button>
              </>
            )}

            {/* Icon buttons with INSIDE badges (no clipping) */}
            <NavLink
              to="/shopping-cart"
              className="relative h-10 w-10 inline-flex items-center justify-center border border-black/10 hover:border-black/30 transition"
              aria-label="Cart"
            >
              <FaShoppingCart />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-black text-white text-[10px] leading-[18px] text-center font-bold">
                  {cartCount}
                </span>
              )}
            </NavLink>

            <NavLink
              to="/wishlist"
              className="relative h-10 w-10 inline-flex items-center justify-center border border-black/10 hover:border-black/30 transition"
              aria-label="Wishlist"
            >
              <FaHeart />
              {wishCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-black text-white text-[10px] leading-[18px] text-center font-bold">
                  {wishCount}
                </span>
              )}
            </NavLink>

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="md:hidden h-10 w-10 inline-flex items-center justify-center border border-black/10 hover:border-black/30 transition"
              aria-label="Menu"
              aria-expanded={open}
            >
              {open ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        {open && (
          <div className="md:hidden pb-4">
            <div className="grid gap-1 pt-2">
              <NavLink
                to="/clothes/sales"
                className={({ isActive }) =>
                  isActive ? `${navLinkClass} ${navLinkActive}` : navLinkClass
                }
              >
                Sales
              </NavLink>
              <NavLink
                to="/clothes/men"
                className={({ isActive }) =>
                  isActive ? `${navLinkClass} ${navLinkActive}` : navLinkClass
                }
              >
                Men
              </NavLink>
              <NavLink
                to="/clothes/women"
                className={({ isActive }) =>
                  isActive ? `${navLinkClass} ${navLinkActive}` : navLinkClass
                }
              >
                Women
              </NavLink>
              <NavLink
                to="/clothes/children"
                className={({ isActive }) =>
                  isActive ? `${navLinkClass} ${navLinkActive}` : navLinkClass
                }
              >
                Children
              </NavLink>

              <div className="h-px bg-black/10 my-2" />

              <NavLink
                to="/shopping-cart"
                className={({ isActive }) =>
                  isActive ? `${navLinkClass} ${navLinkActive}` : navLinkClass
                }
              >
                Cart {cartCount ? `(${cartCount})` : ""}
              </NavLink>
              <NavLink
                to="/wishlist"
                className={({ isActive }) =>
                  isActive ? `${navLinkClass} ${navLinkActive}` : navLinkClass
                }
              >
                Wishlist {wishCount ? `(${wishCount})` : ""}
              </NavLink>

              <div className="h-px bg-black/10 my-2" />

              {!user ? (
                <NavLink
                  to="/signin"
                  className="md:hidden px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-neutral-900"
                >
                  Sign in
                </NavLink>
              ) : (
                <>
                  <NavLink
                    to="/admin/products"
                    className="md:hidden px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-neutral-900"
                  >
                    Manage clothing
                  </NavLink>

                  <button
                    type="button"
                    onClick={logout}
                    className="hidden md:inline-flex px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-neutral-500 hover:text-black transition"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
