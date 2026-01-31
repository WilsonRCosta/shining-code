export default function ClothesSortDropdown({ handleSortByPrice, handleSortBySales }) {
  const handleChange = (e) => {
    const value = e.target.value;

    if (value === "sales") handleSortBySales();
    if (value === "price") handleSortByPrice();
  };

  return (
    <div className="relative inline-block">
      <select
        defaultValue=""
        onChange={handleChange}
        className="w-auto max-w-full border border-black/10 bg-white pl-4 pr-10 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-black outline-none focus:border-black appearance-none"
      >
        <option value="" disabled>
          Sort by
        </option>
        <option value="sales">Sales</option>
        <option value="price">Price</option>
      </select>

      {/* Custom arrow */}
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600">
        <svg
          viewBox="0 0 20 20"
          className="h-3.5 w-3.5"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.5 7.5 10 12l4.5-4.5" />
        </svg>
      </span>
    </div>
  );
}
