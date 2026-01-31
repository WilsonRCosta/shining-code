import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import clothesService, { resolveProductImage } from "../service/api-client";
import PathBreadcrumb from "../components/clothes-page/PathBreadcrumb";
import LoadingDimmer from "../components/LoadingDimmer";
import { CartContext } from "../contexts/CartContext";
import { getClosestColor } from "../utils/color-utils";
import { updateLocalCart, updateLocalWishlist } from "../service/local-storage";
import { WishlistContext } from "../contexts/WishlistContext";
import { notify } from "../utils/notify";
import { useSnackbar } from "notistack";

export default function ClothesDetails() {
  const { code } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const [cloth, setCloth] = useState(null);

  const [fetchError, setFetchError] = useState(null);
  const [fetchComplete, setFetchComplete] = useState(false);

  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [currImage, setCurrImage] = useState(null);
  const [hasNextImage, setNextImage] = useState(false);
  const [hasPrevImage, setPrevImage] = useState(false);

  const { cart, setCart } = useContext(CartContext);
  const { wishlist, setWishlist } = useContext(WishlistContext);

  const isWishlisted = useMemo(() => {
    if (!cloth) return false;
    return Array.isArray(wishlist) && wishlist.some((w) => w.code === cloth.code);
  }, [wishlist, cloth]);

  const priceNow = useMemo(() => {
    if (!cloth) return 0;
    const unit = cloth.discount ? cloth.salesPrice : cloth.price;
    return Number(unit) * Number(quantity);
  }, [cloth, quantity]);

  const colors = useMemo(() => {
    const imgs = cloth?.images || [];
    return Array.from(new Set(imgs.map((im) => im?.color).filter(Boolean)));
  }, [cloth]);

  const imagesOfCurrentColor = useMemo(() => {
    if (!cloth || !currImage) return [];
    return cloth.images.filter((im) => im.color === currImage.color);
  }, [cloth, currImage]);

  const colorName = useMemo(() => {
    if (!currImage?.color) return "UNKNOWN COLOR";

    const res = getClosestColor(currImage.color);
    if (!res.ok || !res.best) return "UNKNOWN COLOR";

    return res.best.name.toUpperCase();
  }, [currImage?.color]);

  const findImageIndex = () => {
    if (!currImage) return { imgsWithColor: [], currImgIdx: -1 };
    const imgsWithColor = imagesOfCurrentColor;
    const sameImg = (a, b) =>
      a?.fileId && b?.fileId
        ? String(a.fileId) === String(b.fileId)
        : a?.name === b?.name;

    const currImgIdx = imgsWithColor.findIndex((i) => sameImg(i, currImage));
    return { imgsWithColor, currImgIdx };
  };

  const handleChangeCurrImageClickInColor = (clickedColor) => {
    if (!cloth?.images?.length) return;
    const first = cloth.images.find((i) => i.color === clickedColor);
    if (first) setCurrImage({ ...first });
  };

  const handleChangeCurrImageClickInImage = (clickedImg) => {
    if (!cloth?.images?.length) return;

    const found = cloth.images.find((image) =>
      clickedImg?.fileId && image?.fileId
        ? String(image.fileId) === String(clickedImg.fileId)
        : image.name === clickedImg.name
    );

    if (found) {
      setCurrImage({ ...found });
    }

    setNextImage(cloth.images.filter((img) => img.color === clickedImg.color).length > 1);
  };

  const handleChangeCurrImageClickInArrows = (offset) => {
    const { imgsWithColor, currImgIdx } = findImageIndex();
    if (currImgIdx < 0) return;
    const next = imgsWithColor[currImgIdx + offset];
    if (next) setCurrImage(next);
  };

  const handleSetQuantity = (delta) => {
    setQuantity((q) => Math.max(1, q + delta));
  };

  const handleWishClick = () => {
    if (!cloth) return;
    const newWishlist = [...wishlist];
    const idx = newWishlist.findIndex((w) => w.code === cloth.code);
    idx > -1 ? newWishlist.splice(idx, 1) : newWishlist.push(cloth);
    setWishlist(newWishlist);
    updateLocalWishlist(cloth);
  };

  const addToCart = () => {
    if (!cloth) return;
    if (!size) {
      notify(enqueueSnackbar, "Please select size", 400);
      return;
    }
    const product = {
      ...cloth,
      size,
      quantity,
      finalPrice: Number(priceNow).toFixed(2),
    };

    updateLocalCart(product);
    setCart([...cart, product]);
  };

  useEffect(() => {
    setFetchComplete(false);
    setFetchError(null);

    clothesService()
      .getProductByCode(code)
      .then((resp) => {
        if (resp.type === "error") {
          setFetchError({ code: resp.code, msg: resp.msg });
          setFetchComplete(true);
          return;
        }

        setCloth(resp.data);

        if (resp.data?.images?.length) {
          setCurrImage(resp.data.images[0]);
          setNextImage(
            resp.data.images.filter((img) => img.color === resp.data.images[0].color)
              .length > 1
          );
        }

        setFetchComplete(true);
      });
  }, [code]);

  useEffect(() => {
    if (!currImage) return;
    const { imgsWithColor, currImgIdx } = findImageIndex();
    setNextImage(currImgIdx >= 0 && currImgIdx < imgsWithColor.length - 1);
    setPrevImage(currImgIdx > 0);
  }, [currImage]);

  if (!fetchComplete) return <LoadingDimmer complete={false} error={null} />;
  if (fetchError) return <LoadingDimmer complete={true} error={fetchError} />;
  if (!cloth || !currImage) return null;

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-4">
          <PathBreadcrumb genre={cloth.genre} code={cloth.code} />

          <Link
            to={`/clothes/${cloth.genre}`}
            className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-800 hover:underline"
          >
            ← Back
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Thumbs */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="grid grid-cols-4 lg:grid-cols-1 gap-3">
              {cloth.images.map((image) => (
                <button
                  key={image.name}
                  type="button"
                  onClick={() => handleChangeCurrImageClickInImage(image)}
                  className="group block border border-black/10 hover:border-black/30 transition"
                  aria-label={`Select image ${image.name}`}
                >
                  <img
                    className="aspect-3/4 w-full object-cover"
                    src={resolveProductImage(image)}
                    alt={cloth.name}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Main image */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative border border-black/10 bg-white">
              <img
                className="w-full object-cover aspect-3/4"
                src={resolveProductImage(currImage)}
                alt={cloth.name}
              />

              {hasPrevImage && (
                <button
                  type="button"
                  onClick={() => handleChangeCurrImageClickInArrows(-1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 border border-black/10 hover:border-black/30 hover:bg-white transition flex items-center justify-center"
                  aria-label="Previous image"
                >
                  ‹
                </button>
              )}

              {hasNextImage && (
                <button
                  type="button"
                  onClick={() => handleChangeCurrImageClickInArrows(1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 border border-black/10 hover:border-black/30 hover:bg-white transition flex items-center justify-center"
                  aria-label="Next image"
                >
                  ›
                </button>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-3 order-3">
            <div className="lg:sticky lg:top-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-lg font-semibold text-neutral-900">{cloth.name}</h1>
                  <button
                    type="button"
                    onClick={handleWishClick}
                    className="h-9 w-9 border border-black/10 hover:border-black/30 transition flex items-center justify-center"
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    title={isWishlisted ? "Wishlisted" : "Add to wishlist"}
                  >
                    <span className={isWishlisted ? "text-red-600" : "text-neutral-700"}>
                      {isWishlisted ? "♥" : "♡"}
                    </span>
                  </button>
                </div>

                <div className="text-xs text-neutral-600">
                  <div className="font-medium text-neutral-900">{cloth.brand}</div>
                  <div className="mt-1">
                    Code: <span className="font-mono">{cloth.code}</span>
                  </div>
                </div>

                <div className="border-t border-black/10 pt-4">
                  {/* Price */}
                  <div className="flex items-baseline gap-3">
                    {cloth.discount ? (
                      <>
                        <div className="text-xl font-semibold text-neutral-900">
                          {Number(priceNow).toFixed(2)}€
                        </div>
                        <div className="text-sm text-neutral-500 line-through">
                          {(Number(quantity) * Number(cloth.price)).toFixed(2)}€
                        </div>
                      </>
                    ) : (
                      <div className="text-xl font-semibold text-neutral-900">
                        {Number(priceNow).toFixed(2)}€
                      </div>
                    )}
                  </div>
                </div>

                {/* Size */}
                <div className="border-t border-black/10 pt-4">
                  <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-700">
                    Size
                  </div>

                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {["XS", "S", "M", "L", "XL"].map((s) => {
                      const active = size === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSize(s)}
                          className={[
                            "h-10 text-xs font-semibold",
                            "border transition",
                            active
                              ? "border-black bg-black text-white"
                              : "border-black/20 hover:border-black/50",
                          ].join(" ")}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity */}
                <div className="border-t border-black/10 pt-4">
                  <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-700">
                    Quantity
                  </div>

                  <div className="mt-3 inline-flex items-center border border-black/20">
                    <button
                      type="button"
                      onClick={() => handleSetQuantity(-1)}
                      className="h-10 w-10 hover:bg-black hover:text-white transition"
                      aria-label="Decrease quantity"
                    >
                      –
                    </button>
                    <div className="h-10 w-12 flex items-center justify-center text-sm font-semibold">
                      {quantity}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSetQuantity(1)}
                      className="h-10 w-10 hover:bg-black hover:text-white transition"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Color */}
                <div className="border-t border-black/10 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-700">
                      Color
                    </div>
                    <div className="text-xs text-neutral-500">{colorName}</div>
                  </div>

                  {colors.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {colors.map((c) => {
                        const active = currImage?.color === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => handleChangeCurrImageClickInColor(c)}
                            className={[
                              "h-6 w-6 rounded-full border transition",
                              active
                                ? "border-black"
                                : "border-black/20 hover:border-black/60",
                            ].join(" ")}
                            style={{ backgroundColor: c }}
                            title={c}
                            aria-label={`Select color ${c}`}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Add to cart */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={addToCart}
                    className="w-full h-12 bg-black text-white text-[12px] font-extrabold tracking-[0.22em] uppercase hover:bg-neutral-800 transition"
                  >
                    Add to cart
                  </button>
                  {!size && (
                    <div className="mt-2 text-xs text-neutral-500">
                      Select a size to add to cart.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* optional: “more images in same color” row */}
        {imagesOfCurrentColor.length > 1 && (
          <div className="mt-10 border-t border-black/10 pt-6">
            <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-700">
              More in this color
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {imagesOfCurrentColor.map((im) => (
                <button
                  key={im.name}
                  type="button"
                  onClick={() => setCurrImage(im)}
                  className={[
                    "border transition",
                    im.name === currImage.name
                      ? "border-black"
                      : "border-black/10 hover:border-black/30",
                  ].join(" ")}
                  aria-label={`Select image ${im.name}`}
                >
                  <img
                    className="aspect-3/4 w-full object-cover"
                    src={resolveProductImage(im)}
                    alt={cloth.name}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
