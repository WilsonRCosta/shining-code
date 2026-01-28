import React, { useMemo, useState, useContext } from "react";
import { useSnackbar } from "notistack";
import clothesService from "../../service/serviceAPI";
import ImageAndColorGrid from "./ImageAndColorGrid";
import { UserContext } from "../../contexts/UserContext";

export default function AddProductModal({ clothes, setClothes }) {
  const { enqueueSnackbar } = useSnackbar();

  const emptyProduct = useMemo(
    () => ({
      code: "",
      name: "",
      brand: "",
      genre: "",
      type: "",
      price: "",
      discount: 0,
      salesPrice: "0.00",
      images: [],
      colors: [],
      files: [],
    }),
    []
  );

  const [product, setProduct] = useState(emptyProduct);
  const { tokenProvider } = useContext(UserContext);
  const [token] = tokenProvider;

  const [open, setOpen] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [activeImageAndColor, setActiveImageAndColor] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canCreate =
    product.name &&
    product.type &&
    product.brand &&
    product.genre &&
    product.price !== "" &&
    !Number.isNaN(Number(product.price)) &&
    Array.isArray(product.files) &&
    product.files.length > 0 &&
    !submitting;

  const closeAndReset = () => {
    setOpen(false);
    setDiscountOpen(false);
    setActiveImageAndColor(false);
    setSubmitting(false);
    setProduct(emptyProduct);
  };

  const changeProduct = (e) => {
    const { name, value } = e.target;
    setProduct((p) => ({ ...p, [name]: value }));
  };

  const setSelect = (name, value) => {
    setProduct((p) => ({ ...p, [name]: value }));
  };

  const onPriceChange = (e) => {
    const value = e.target.value;
    // allow empty during typing
    if (value === "") return setProduct((p) => ({ ...p, price: "" }));
    if (Number.isNaN(Number(value))) return;
    setProduct((p) => ({ ...p, price: value }));
  };

  const generateNumber = () => {
    const random = Math.floor(Math.random() * 999);
    return String(random).padStart(3, "0");
  };

  const buildCodeBlock = () => {
    const codeGenre = product.genre?.charAt(0)?.toUpperCase() || "X";
    const type2 = (product.type || "").replace("-", "").substring(0, 2).toUpperCase();
    return `${codeGenre}${type2}-`;
  };

  const changeDiscount = (value) => {
    const discount = Number(value);
    const price = Number(product.price || 0);
    const salesPrice = (price * (1 - discount / 100)).toFixed(2);

    setProduct((p) => ({
      ...p,
      discount,
      salesPrice,
    }));
  };

  const generateUniqueCode = async () => {
    const resp = await clothesService().getProducts();
    if (resp.type === "error") throw new Error(resp.msg || "Failed to get products");

    const existing = new Set(resp.data.map((p) => p.code));
    const codeBlock = buildCodeBlock();

    let code = codeBlock + generateNumber();
    while (existing.has(code)) code = codeBlock + generateNumber();

    return code;
  };

  const createProductFlow = async () => {
    try {
      setSubmitting(true);

      const code = await generateUniqueCode();

      const payload = {
        ...product,
        code,
        price: Number(product.price),
        salesPrice: product.discount ? Number(product.salesPrice) : 0,
      };

      const createResp = await clothesService().createProduct(payload, token);
      enqueueSnackbar(createResp.msg, { variant: createResp.type });

      if (createResp.type === "error") {
        setSubmitting(false);
        return;
      }

      // Upload images
      if (payload.files?.length) {
        const imgResp = await clothesService().addImageToProduct(
          payload.files,
          code,
          token
        );

        if (imgResp.type === "error") {
          enqueueSnackbar(imgResp.msg, { variant: "error" });
          setSubmitting(false);
          return;
        }
      }

      // Update list optimistically
      setClothes([...clothes, payload]);

      enqueueSnackbar("Product created!", { variant: "success" });
      closeAndReset();
    } catch (err) {
      enqueueSnackbar(err?.message || "Something went wrong", { variant: "error" });
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-black text-white px-6 py-3 text-xs font-semibold tracking-[0.22em] uppercase hover:bg-neutral-800 transition"
      >
        Add New Product
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <button
            type="button"
            onClick={closeAndReset}
            className="absolute inset-0 bg-black/40"
            aria-label="Close modal"
          />

          {/* Panel */}
          <div className="relative mx-auto mt-10 w-[92%] max-w-4xl bg-white border border-black/10 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
              <div>
                <h2 className="text-sm font-semibold tracking-[0.18em] uppercase text-black">
                  Add New Product
                </h2>
                {product.colors?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <span
                        key={c}
                        className="h-5 w-5 rounded-full border border-black/20"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={closeAndReset}
                className="px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-neutral-600 hover:text-black"
              >
                Close
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600">
                    Name
                  </label>
                  <input
                    name="name"
                    maxLength={30}
                    value={product.name}
                    onChange={changeProduct}
                    placeholder="Name"
                    className="mt-2 w-full border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
                  />
                </div>

                {/* Genre */}
                <div>
                  <label className="block text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600">
                    Genre
                  </label>
                  <select
                    value={product.genre}
                    onChange={(e) => setSelect("genre", e.target.value)}
                    className="mt-2 w-full border border-black/15 px-3 py-2 text-sm bg-white outline-none focus:border-black"
                  >
                    <option value="" disabled>
                      Select genre
                    </option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="children">Children</option>
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600">
                    Brand
                  </label>
                  <input
                    name="brand"
                    maxLength={15}
                    value={product.brand}
                    onChange={changeProduct}
                    placeholder="Brand"
                    className="mt-2 w-full border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600">
                    Type
                  </label>
                  <select
                    value={product.type}
                    onChange={(e) => setSelect("type", e.target.value)}
                    className="mt-2 w-full border border-black/15 px-3 py-2 text-sm bg-white outline-none focus:border-black"
                  >
                    <option value="" disabled>
                      Select type
                    </option>
                    <option value="accessories">Accessory</option>
                    <option value="jackets">Jacket</option>
                    <option value="jeans">Jeans</option>
                    <option value="shirts">Shirt</option>
                    <option value="shoes">Shoes</option>
                    <option value="t-shirt">T-Shirt</option>
                    <option value="underwear">Underwear</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600">
                    Price (€)
                  </label>
                  <input
                    name="price"
                    inputMode="decimal"
                    value={product.price}
                    onChange={onPriceChange}
                    placeholder="0.00"
                    className="mt-2 w-full border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
                  />
                  {product.price !== "" && Number.isNaN(Number(product.price)) && (
                    <p className="mt-2 text-xs text-red-600">Price must be numeric</p>
                  )}
                </div>
              </div>

              {/* Actions row */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={!product.price || Number.isNaN(Number(product.price))}
                  onClick={() => {
                    setDiscountOpen((v) => !v);
                    setProduct((p) => ({ ...p, discount: 0, salesPrice: "0.00" }));
                  }}
                  className="border border-black/15 px-4 py-2 text-xs font-semibold tracking-[0.18em] uppercase hover:border-black disabled:opacity-40"
                >
                  Set discount
                </button>

                <button
                  type="button"
                  onClick={() => setActiveImageAndColor((v) => !v)}
                  className="border border-black/15 px-4 py-2 text-xs font-semibold tracking-[0.18em] uppercase hover:border-black"
                >
                  Add new image
                </button>

                {product.colors?.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setProduct((p) => ({ ...p, images: [], colors: [], files: [] }))
                    }
                    className="ml-auto border border-black/15 px-4 py-2 text-xs font-semibold tracking-[0.18em] uppercase hover:border-black"
                  >
                    Reset images
                  </button>
                )}
              </div>

              {/* Discount section */}
              {discountOpen && (
                <div className="mt-6 border-t border-black/10 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600">
                      Discount: {product.discount}%
                    </div>
                    <div className="text-sm font-semibold text-black">
                      Sales price: {product.salesPrice}€
                    </div>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={product.discount}
                    onChange={(e) => changeDiscount(e.target.value)}
                    className="mt-4 w-full"
                  />
                </div>
              )}

              {/* Image grid */}
              {activeImageAndColor && (
                <div className="mt-6 border-t border-black/10 pt-6">
                  <ImageAndColorGrid
                    product={product}
                    setProduct={setProduct}
                    activeImageAndColor={activeImageAndColor}
                    setActiveImageAndColor={setActiveImageAndColor}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/10">
              <button
                type="button"
                onClick={closeAndReset}
                className="px-4 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-neutral-600 hover:text-black"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!canCreate}
                onClick={createProductFlow}
                className="bg-black text-white px-6 py-3 text-xs font-semibold tracking-[0.22em] uppercase hover:bg-neutral-800 disabled:opacity-40 transition"
              >
                {submitting ? "Creating..." : "Create product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
