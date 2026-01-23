export default function ClothesSortDropdown({ handleSortByPrice, handleSortBySales }) {
  const handleChange = (e) => {
    const value = e.target.value;

    if (value === "sales") handleSortBySales();
    if (value === "price") handleSortByPrice();
  };

  return (
    <div className="flex justify-end px-4">
      <div className="w-full sm:w-auto">
        <select
          defaultValue=""
          onChange={handleChange}
          className="w-full sm:w-44 border border-black/15 bg-white px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-black outline-none focus:border-black"
        >
          <option value="" disabled>
            Sort by
          </option>
          <option value="sales">Sales</option>
          <option value="price">Price</option>
        </select>
      </div>
    </div>
  );
}
