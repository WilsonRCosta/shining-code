import React, { useEffect, useRef } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

export default function ClothesSearchBar({
  activeInput,
  handleSearchInput,
  setActiveInput,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (activeInput) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [activeInput]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && activeInput) setActiveInput(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeInput, setActiveInput]);

  return (
    <div className="mx-auto max-w-6xl px-4 mt-4 flex items-center gap-3">
      {/* Toggle */}
      <button
        type="button"
        onClick={() => setActiveInput((v) => !v)}
        aria-label={activeInput ? "Close search" : "Open search"}
        className="h-10 w-10 inline-flex items-center justify-center border border-black/10 hover:border-black/30 transition"
      >
        {activeInput ? <FaTimes size={16} /> : <FaSearch size={16} />}
      </button>

      {/* Input */}
      <div className="flex-1">
        {activeInput && (
          <input
            ref={inputRef}
            type="text"
            placeholder="SEARCH"
            onChange={(e) => handleSearchInput(e.target.value)}
            className="w-full bg-transparent border-b border-black/20 focus:border-black outline-none py-2 text-xs font-semibold tracking-[0.22em] uppercase text-black placeholder:text-black/40"
          />
        )}
      </div>

      {/* Optional clear button (only when open) */}
      {activeInput && (
        <button
          type="button"
          onClick={() => {
            handleSearchInput("");
            setActiveInput(false);
          }}
          className="text-xs font-semibold tracking-[0.18em] uppercase text-neutral-500 hover:text-black"
        >
          Clear
        </button>
      )}
    </div>
  );
}
