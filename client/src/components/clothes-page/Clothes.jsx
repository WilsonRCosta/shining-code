import React, { useState, useEffect, useContext, useMemo } from "react";
import clothesService from "../../service/api-client";

import NavBar from "../NavBar";
import LoadingDimmer from "../LoadingDimmer";
import ClothesSearchBar from "./ClothesSearchBar";
import PathBreadcrumb from "./PathBreadcrumb";
import ClothesMenu from "./ClothesMenu";
import ClothesCard from "./ClothesCard";
import ClothesSortDropdown from "./ClothesSortDropdown";

import { WishlistContext } from "../../contexts/WishlistContext";
import { updateLocalWishlist } from "../../service/local-storage";
import { useLocation, useParams } from "react-router-dom";

export default function Clothes() {
  const { genre } = useParams();
  const { pathname } = useLocation();
  const isSalesRoute = pathname === "/clothes/sales";

  const [fetchComplete, setFetchComplete] = useState(false);
  const [fetchError, setFetchError] = useState({ code: null, msg: null });

  const [currClothes, setCurrClothes] = useState([]);
  const [allClothes, setAllClothes] = useState([]);

  const [brands, setBrands] = useState([]);
  const [types, setTypes] = useState([]);

  const [activeType, setActiveType] = useState(null);
  const [activeBrand, setActiveBrand] = useState(null);
  const [activeInput, setActiveInput] = useState(false);

  const [currImages, setCurrImages] = useState([]);

  const { wishlist, setWishlist } = useContext(WishlistContext);

  const removeMenuFilters = () => {
    setCurrClothes(allClothes);
    setCurrImages(
      allClothes.map((product) => ({
        code: product.code,
        currImage: product.images?.find((im) => im.fileId) || product.images?.[0],
      }))
    );
  };

  const filterByTypeAndBrand = () =>
    setCurrClothes(
      allClothes.filter(
        (cl) =>
          cl.type === activeType?.toString().toLowerCase() && cl.brand === activeBrand
      )
    );

  const filterByType = () =>
    setCurrClothes(
      allClothes.filter((cl) => cl.type === activeType?.toString().toLowerCase())
    );

  const filterByBrand = () =>
    setCurrClothes(allClothes.filter((cl) => cl.brand === activeBrand));

  const handleSortByPrice = () =>
    setCurrClothes(
      [...currClothes].sort((a, b) => {
        let currA = a.price,
          currB = b.price;
        if (a.salesPrice) currA = a.salesPrice;
        if (b.salesPrice) currB = b.salesPrice;
        return currA - currB;
      })
    );

  const handleSortBySales = () =>
    setCurrClothes(
      [...currClothes].sort((a, b) => {
        if (a.salesPrice === 0) return 1;
        if (b.salesPrice === 0) return -1;
        return a.salesPrice - b.salesPrice;
      })
    );

  const handleSearchInput = (value) => {
    setCurrClothes(
      allClothes.filter((cl) =>
        cl.name.toLowerCase().includes((value || "").toLowerCase())
      )
    );
  };

  const handleChangeImageClick = (cloth, color) => {
    const imgOfColorChosen = cloth.images?.find((i) => i.color === color);
    if (!imgOfColorChosen) return;

    setCurrImages((prev) =>
      prev.map((img) =>
        img.code === cloth.code ? { ...img, currImage: imgOfColorChosen } : img
      )
    );
  };

  const handleWishClick = (code) => {
    const newWishObj = currClothes.find((w) => w.code === code);
    if (!newWishObj) return;

    const newWishlist = [...wishlist];
    const objIdx = newWishlist.findIndex((w) => w.code === newWishObj.code);

    objIdx > -1 ? newWishlist.splice(objIdx, 1) : newWishlist.push(newWishObj);

    setWishlist(newWishlist);
    updateLocalWishlist(newWishObj);
  };

  useEffect(() => {
    setFetchComplete(false);

    clothesService()
      .getProducts(isSalesRoute ? { sale: true } : { genre })
      .then((resp) => {
        if (resp.type === "error") {
          setFetchError({ code: resp.code, msg: resp.msg });
          return;
        }

        setCurrClothes(resp.data);
        setAllClothes(resp.data);
        setFetchComplete(true);
      });
  }, [genre]);

  useEffect(() => {
    setCurrImages(
      currClothes.map((product) => ({
        code: product.code,
        currImage: product.images?.find((im) => im.fileId) || product.images?.[0],
      }))
    );

    setTypes(
      currClothes
        .map((product) => product.type)
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .sort()
    );

    setBrands(
      currClothes
        .map((product) => product.brand)
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .sort()
    );
  }, [currClothes]);

  useEffect(() => {
    activeType
      ? activeBrand
        ? filterByTypeAndBrand()
        : filterByType()
      : activeBrand
        ? filterByBrand()
        : removeMenuFilters();
  }, [activeBrand, activeType]);

  const productsCount = useMemo(
    () => (Array.isArray(currClothes) ? currClothes.length : 0),
    [currClothes]
  );

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      {!fetchComplete ? (
        <LoadingDimmer complete={fetchComplete} error={fetchError} />
      ) : (
        <main className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-start justify-between gap-4">
            <PathBreadcrumb activeType={activeType} genre={genre} />
            <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600 pt-3">
              {productsCount} items
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-3">
            <ClothesSearchBar
              activeInput={activeInput}
              handleSearchInput={handleSearchInput}
              setActiveInput={setActiveInput}
            />
            <ClothesSortDropdown
              handleSortByPrice={handleSortByPrice}
              handleSortBySales={handleSortBySales}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
            {/* Sidebar filters */}
            <div className="lg:sticky lg:top-24 h-fit">
              <ClothesMenu
                activeType={activeType}
                activeBrand={activeBrand}
                brands={brands}
                types={types}
                setActiveType={setActiveType}
                setActiveBrand={setActiveBrand}
              />
            </div>

            {/* Products grid */}
            <section>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {currClothes.map((cloth) => (
                  <div key={cloth.code}>
                    <ClothesCard
                      cloth={cloth}
                      handleChangeImageClick={handleChangeImageClick}
                      wishlist={wishlist}
                      handleWishClick={handleWishClick}
                      thumbnail={currImages.find((c) => c.code === cloth.code)}
                    />
                  </div>
                ))}
              </div>

              {productsCount === 0 && (
                <div className="mt-12 border border-black/10 p-8 text-center">
                  <h3 className="text-lg font-semibold text-black">No items found</h3>
                  <p className="mt-2 text-sm text-neutral-500">
                    Try clearing filters or searching for something else.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveType(null);
                      setActiveBrand(null);
                      removeMenuFilters();
                    }}
                    className="mt-6 inline-flex bg-black text-white py-3 px-6 text-xs font-semibold tracking-[0.22em] uppercase hover:bg-neutral-800 transition"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </section>
          </div>
        </main>
      )}
    </div>
  );
}
