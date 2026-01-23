import React, { useEffect, useRef, useState } from "react";

export default function SortProducts({ handleSortByProp }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const options = [
    { label: "Code", value: "code" },
    { label: "Name", value: "name" },
    { label: "Genre", value: "genre" },
    { label: "Brand", value: "brand" },
    { label: "Type", value: "type" },
    { label: "Price", value: "price" },
  ];

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="w-[95%] mx-auto flex justify-end">
      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="px-4 py-2 border border-black/20 bg-white text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-800 hover:bg-black hover:text-white transition"
        >
          Sort by
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-black/10 shadow-lg z-20">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  handleSortByProp(opt.value);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-xs text-neutral-800 hover:bg-black hover:text-white transition"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
