import React from "react";
import EditProductModal from "./EditProductModal";
import DeleteProductModal from "./DeleteProductModal";

export default function ProductsTable({ clothes, setClothes }) {
  return (
    <div className="mx-auto w-[95%] bg-white border border-black/10 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-black/10">
        <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-700">
          Products
        </div>
        <div className="text-xs text-neutral-500">
          Total: <span className="text-neutral-900 font-semibold">{clothes.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="sticky top-0 bg-white z-10 border-b border-black/10">
            <tr className="text-[11px] font-extrabold tracking-[0.20em] uppercase text-neutral-600">
              <th className="text-left px-5 py-3">Code</th>
              <th className="text-left px-5 py-3">Name</th>
              <th className="text-left px-5 py-3">Genre</th>
              <th className="text-left px-5 py-3">Brand</th>
              <th className="text-left px-5 py-3">Type</th>
              <th className="text-left px-5 py-3">Price</th>
              <th className="text-left px-5 py-3">Colors</th>
              <th className="text-left px-5 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-black/5">
            {clothes.map((p) => (
              <tr key={p.code} className="hover:bg-black/[0.02] transition">
                <td className="px-5 py-4 text-neutral-500 font-mono text-xs">{p.code}</td>

                <td className="px-5 py-4">
                  <a
                    href={`/#/clothes/${p.genre}/${p.code}`}
                    className="text-neutral-900 hover:underline"
                  >
                    <span className="font-semibold">{p.name}</span>
                  </a>
                </td>

                <td className="px-5 py-4 text-neutral-800">
                  {p.genre ? p.genre.charAt(0).toUpperCase() + p.genre.slice(1) : "-"}
                </td>

                <td className="px-5 py-4 text-neutral-800">{p.brand || "-"}</td>

                <td className="px-5 py-4 text-neutral-800">
                  {p.type ? p.type.charAt(0).toUpperCase() + p.type.slice(1) : "-"}
                </td>

                <td className="px-5 py-4 text-neutral-900">
                  {Number(p.price || 0).toFixed(2)}€
                </td>

                <td className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {(p.colors || []).map((c) => (
                      <span
                        key={`${p.code}-${c}`}
                        className="h-4 w-4 rounded-full border border-black/20"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                    {(p.colors || []).length === 0 && (
                      <span className="text-xs text-neutral-400">—</span>
                    )}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <EditProductModal
                      product={p}
                      clothes={clothes}
                      setClothes={setClothes}
                    />
                    <DeleteProductModal
                      product={p}
                      clothes={clothes}
                      setClothes={setClothes}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {clothes.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-neutral-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
