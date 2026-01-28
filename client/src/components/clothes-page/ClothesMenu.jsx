export default function ClothesMenu({
  activeType,
  activeBrand,
  brands = [],
  types = [],
  setActiveType,
  setActiveBrand,
}) {
  const hasFilters = Boolean(activeType || activeBrand);

  const Chip = ({ label, onRemove }) => (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-2 border border-black/20 px-3 py-2 text-xs font-semibold tracking-[0.12em] uppercase"
    >
      {label}
      <span className="opacity-60">×</span>
    </button>
  );

  const SectionTitle = ({ children }) => (
    <div className="mt-5 mb-2 text-[11px] font-extrabold tracking-[0.18em] uppercase text-neutral-900">
      {children}
    </div>
  );

  const Item = ({ label, active, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left py-2 text-xs font-semibold tracking-[0.12em] uppercase transition
        ${active ? "text-neutral-400" : "text-neutral-900 hover:text-neutral-500"}`}
    >
      {label}
    </button>
  );

  return (
    <aside className="p-3">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-extrabold tracking-[0.18em] uppercase">
          Filters
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setActiveType(null);
              setActiveBrand(null);
            }}
            className="text-[11px] font-bold tracking-[0.18em] uppercase text-neutral-600 hover:text-black"
          >
            Clear
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {activeType && <Chip label={activeType} onRemove={() => setActiveType(null)} />}
        {activeBrand && (
          <Chip label={activeBrand} onRemove={() => setActiveBrand(null)} />
        )}
      </div>

      <SectionTitle>Type</SectionTitle>
      <div className="border-t border-black/10 pt-2">
        {types.map((type) => (
          <Item
            key={type}
            label={type}
            active={activeType === type}
            onClick={() => setActiveType(activeType === type ? null : type)}
          />
        ))}
      </div>

      <SectionTitle>Brand</SectionTitle>
      <div className="border-t border-black/10 pt-2">
        {brands.map((brand) => (
          <Item
            key={brand}
            label={brand}
            active={activeBrand === brand}
            onClick={() => setActiveBrand(activeBrand === brand ? null : brand)}
          />
        ))}
      </div>
    </aside>
  );
}
