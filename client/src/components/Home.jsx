import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "./NavBar";
import clothesService from "../service/serviceAPI";
import LoadingDimmer from "./LoadingDimmer";

export default function Home() {
  const [salesClothes, setClothes] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [fetchComplete, setFetchComplete] = useState(false);

  useEffect(() => {
    setFetchComplete(false);

    clothesService()
      .getProducts({ sale: true })
      .then((resp) => {
        if (resp.type === "error") {
          setFetchError({ code: resp.status, msg: resp.msg });
          return;
        }

        setClothes(resp.data.sort((a, b) => (a.discount >= b.discount ? 1 : -1)));

        setFetchComplete(true);
      });
  }, []);

  return (
    <div className="min-h-screen">
      <NavBar />

      {!fetchComplete ? (
        <LoadingDimmer complete={fetchComplete} error={fetchError} />
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
              const img = cl.images?.[0];

              return (
                <Link
                  key={cl.code}
                  to={`/clothes/${cl.genre}/${cl.code}`}
                  className="group block"
                >
                  <div className="relative w-full overflow-hidden bg-neutral-100">
                    <img
                      src={`data:image/${img?.type};base64,${img?.data}`}
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
