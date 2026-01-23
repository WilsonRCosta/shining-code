import React from "react";
import { Link } from "react-router-dom";

export default function PathBreadcrumb({ activeType, genre, code }) {
  const genreLabel = genre ? genre.charAt(0).toUpperCase() + genre.slice(1) : "Sales";

  const activeTypeLabel = activeType
    ? activeType.charAt(0).toUpperCase() + activeType.slice(1)
    : null;

  return (
    <nav className="px-4 py-3">
      <ol className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase text-black/60">
        <li>
          <Link to="/" className="hover:text-black">
            Home
          </Link>
        </li>

        <li className="text-black/30">/</li>

        <li>
          <Link
            to={genre ? `/clothes/${genre}` : "/clothes/sales"}
            className="hover:text-black"
          >
            {genreLabel}
          </Link>
        </li>

        {code && (
          <>
            <li className="text-black/30">/</li>
            <li className="text-black">{code}</li>
          </>
        )}

        {activeTypeLabel && (
          <>
            <li className="text-black/30">/</li>
            <li className="text-black">{activeTypeLabel}</li>
          </>
        )}
      </ol>
    </nav>
  );
}
