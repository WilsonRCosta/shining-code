import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import clothesService, { resolveProductImage } from "../service/api-client";
import LoadingDimmer from "../components/LoadingDimmer";

export default function Home() {
  const [salesClothes, setClothes] = useState([]);
  const [fetchError, setFetchError] = useState({ code: null, msg: null });
  const [fetchComplete, setFetchComplete] = useState(false);
  const hasError = !!fetchError?.code;

  const loadProducts = useCallback(() => {
    setFetchComplete(false);
    setFetchError({ code: null, msg: null });

    clothesService()
      .getProducts({ sale: true })
      .then((resp) => {
        if (resp.type === "error") {
          setFetchError({ code: resp.code, msg: resp.msg });
          setFetchComplete(true);
          return;
        }

        setClothes([...resp.data].sort((a, b) => (b.discount || 0) - (a.discount || 0)));
        setFetchComplete(true);
      })
      .catch((e) => {
        setFetchError({ code: 500, msg: e?.message || "Unknown error" });
        setFetchComplete(true);
      });
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <div className="min-h-screen">
      <NavBar />

      {!fetchComplete || hasError ? (
        <LoadingDimmer
          complete={fetchComplete}
          error={hasError ? fetchError : null}
          onRetry={loadProducts}
        />
      ) : (
        <div className="px-4 sm:px-6 lg:px-10 py-6">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black">
              Sale
            </h1>
            <p className="text-sm text-neutral-500 mt-1">Best discounts right now</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {salesClothes.map((cl) => {
              const img = cl.images?.find((x) => x.fileId) || cl.images?.[0];

              return (
                <Link
                  key={cl.code}
                  to={`/clothes/${cl.genre}/${cl.code}`}
                  className="group block"
                >
                  <div className="relative w-full overflow-hidden bg-neutral-100">
                    <img
                      src={resolveProductImage(img)}
                      alt={cl.name}
                      className="h-65 sm:h-85 lg:h-105 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      loading="lazy"
                    />

                    {/* Discount badge */}
                    {cl.discount ? (
                      <div className="absolute top-3 left-3 bg-black text-white text-xs px-2 py-1 tracking-wide">
                        -{cl.discount}%
                      </div>
                    ) : null}
                  </div>

                  <div className="pt-3">
                    <p className="text-sm font-medium text-black line-clamp-1">
                      {cl.name}
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm text-neutral-400 line-through">
                        {cl.price.toFixed(2)}€
                      </span>
                      <span className="text-sm font-semibold text-black">
                        {cl.salesPrice.toFixed(2)}€
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
