import { useEffect, useState } from "react";
import NavBar from "../NavBar";
import clothesService from "../../service/serviceAPI";
import LoadingDimmer from "../LoadingDimmer";
import AddProductModal from "./AddProductModal";
import SortProducts from "./SortProducts";
import ProductsTable from "./ProductsTable";

export default function AdminProducts() {
  const [clothes, setClothes] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [fetchComplete, setFetchComplete] = useState(false);

  const handleSortByProp = (prop) => {
    setClothes((prev) => [...prev].sort((a, b) => (a[prop] >= b[prop] ? 1 : -1)));
  };

  useEffect(() => {
    setFetchComplete(false);
    clothesService()
      .getProducts()
      .then((resp) => {
        if (resp.type === "error") {
          setFetchError({ code: resp.code, msg: resp.msg });
          setFetchComplete(true);
          return;
        }
        setClothes(resp.data.sort((a, b) => (a.code >= b.code ? 1 : -1)));
        setFetchComplete(true);
      });
  }, []);

  return (
    <div className="min-h-screen">
      <NavBar />

      <div className="mx-auto max-w-6xl px-4 pt-6">
        {/* Top row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <AddProductModal clothes={clothes} setClothes={setClothes} />

          <div className="border border-black/10 px-6 py-4">
            <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-500">
              Products
            </div>
            <div className="mt-1 text-3xl font-semibold text-black">{clothes.length}</div>
          </div>
        </div>

        {/* Content */}
        {fetchComplete ? (
          <>
            <div className="mt-6">
              <SortProducts handleSortByProp={handleSortByProp} />
            </div>

            <div className="mt-6">
              {clothes.length > 0 ? (
                <ProductsTable clothes={clothes} setClothes={setClothes} />
              ) : (
                <div className="mt-20 border border-black/10 bg-white p-10 text-center">
                  <p className="text-sm font-semibold tracking-[0.18em] uppercase text-neutral-700">
                    No items stored.
                  </p>
                </div>
              )}
            </div>

            <div className="h-10" />
          </>
        ) : (
          <LoadingDimmer complete={fetchComplete} error={fetchError} />
        )}
      </div>
    </div>
  );
}
