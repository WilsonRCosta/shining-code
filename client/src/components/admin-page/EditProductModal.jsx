import React, { useMemo, useState, useContext } from "react";
import clothesService from "../../service/serviceAPI";
import ImageAndColorGrid from "./ImageAndColorGrid";
import { UserContext } from "../../contexts/UserContext";
import { useSnackbar } from "notistack";
import { FaPen, FaTimes, FaTrash } from "react-icons/fa";

const GENRE_OPTIONS = [
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Children", value: "children" },
];

const TYPE_OPTIONS = [
  { label: "Accessory", value: "accessories" },
  { label: "Jacket", value: "jackets" },
  { label: "Jeans", value: "jeans" },
  { label: "Shirt", value: "shirts" },
  { label: "Shoes", value: "shoes" },
  { label: "T-Shirt", value: "t-shirt" },
  { label: "Underwear", value: "underwear" },
];

export default function EditProductModal({ product, clothes, setClothes }) {
  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [activeImageAndColor, setActiveImageAndColor] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newProduct, setNewProduct] = useState({ ...product, files: [] });

  const { tokenProvider } = useContext(UserContext);
  const [token] = tokenProvider;

  const closeModal = () => {
    setOpen(false);
    setDiscountOpen(false);
    setActiveImageAndColor(false);
    setSaving(false);
    setNewProduct({ ...product, files: [] });
  };

  const changeNewProduct = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const checkIfNum = (e) => {
    const { name, value } = e.target;
    if (value === "") {
      setNewProduct((prev) => ({ ...prev, [name]: "" }));
      return;
    }
    if (isNaN(value.toString())) {
      setNewProduct((prev) => ({ ...prev, [name]: undefined }));
    } else {
      setNewProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const constructBase64Format = (type) => `data:image/${type};base64,`;

  const getImageInBase64 = (image) => {
    if (!image?.data) return "";
    return image.data.startsWith("data")
      ? image.data
      : `${constructBase64Format(image.type)}${image.data}`;
  };

  const moveImagesToFileArray = (prod) => {
    // Convert any "new" images (with data) into Files to send to server,
    // and set their data to null (server stores them)
    const productToEdit = {
      ...prod,
      files: [...(prod.files || [])],
      images: [...(prod.images || [])],
    };

    productToEdit.images
      .filter((img) => img.data)
      .forEach((img, idx) => {
        const base64 = img.data.startsWith("data")
          ? img.data.replace(constructBase64Format(img.type), "")
          : img.data;

        const bstr = atob(base64);
        let n = bstr.length;
        const u8Array = new Uint8Array(n);
        while (n--) u8Array[n] = bstr.charCodeAt(n);

        productToEdit.files.push(
          new File([u8Array], img.name, { type: `image/${img.type}` })
        );

        // find by name and null out data
        const realIdx = productToEdit.images.findIndex((x) => x.name === img.name);
        if (realIdx >= 0)
          productToEdit.images[realIdx] = {
            ...productToEdit.images[realIdx],
            data: null,
          };
      });

    return productToEdit;
  };

  const handleDeleteImage = (image) => {
    setNewProduct((prev) => {
      const next = { ...prev };
      next.images = (next.images || []).filter((img) => img.name !== image.name);

      // remove colors that no longer exist in images
      const usedColors = new Set(next.images.map((img) => img.color));
      next.colors = (next.colors || []).filter((c) => usedColors.has(c));

      return next;
    });
  };

  const handleChangeDiscountAndPrice = (e) => {
    const discount = Number(e.target.value || 0);
    const price = Number(newProduct.price || 0);
    const salesPrice = Number((price * (1 - discount / 100)).toFixed(2));

    setNewProduct((prev) => ({
      ...prev,
      discount,
      salesPrice,
    }));
  };

  const canSave = useMemo(() => {
    return (
      Boolean(newProduct?.name) &&
      Boolean(newProduct?.type) &&
      Boolean(newProduct?.brand) &&
      newProduct?.price !== undefined &&
      newProduct?.price !== "" &&
      Boolean(newProduct?.genre) &&
      (newProduct?.images?.length || 0) > 0
    );
  }, [newProduct]);

  const handleEditProduct = async () => {
    if (!canSave || saving) return;

    try {
      setSaving(true);

      // move images with base64 -> files, and null their data
      const productToSend = moveImagesToFileArray(newProduct);

      const resp = await clothesService().editProduct(productToSend, token);
      enqueueSnackbar(resp.msg, { variant: resp.type });

      if (resp.type === "error") {
        setSaving(false);
        return;
      }

      if ((productToSend.files || []).length > 0) {
        const imgResp = await clothesService().addImageToProduct(
          productToSend.files,
          product.code,
          token
        );
        if (imgResp.type === "error") {
          enqueueSnackbar(imgResp.msg, { variant: imgResp.type });
        }
      }

      // Update UI state
      setClothes((prev) => {
        const idx = prev.findIndex((cl) => cl.code === productToSend.code);
        if (idx < 0) return prev;

        // keep local view consistent: clear files, keep images data null
        const updated = { ...productToSend, files: [] };
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      });

      setSaving(false);
      setOpen(false);
    } catch (err) {
      enqueueSnackbar(err?.message || "Failed to edit product", { variant: "error" });
      setSaving(false);
    }
  };

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setNewProduct({ ...product, files: [] });
          setOpen(true);
        }}
        className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-black/10 bg-white hover:border-black/30 transition"
        aria-label="Edit product"
        title="Edit"
      >
        <FaPen className="text-neutral-700" size={14} />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <button
            type="button"
            onClick={() => !saving && closeModal()}
            className="absolute inset-0 bg-black/40"
            aria-label="Close edit modal"
          />

          {/* Panel */}
          <div className="relative mx-auto mt-10 w-[94%] max-w-3xl bg-white border border-black/10 shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-black/10">
              <div>
                <div className="text-sm font-semibold tracking-[0.18em] uppercase text-black">
                  Edit product
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  Code: <span className="text-neutral-800">{newProduct.code}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Color dots */}
                <div className="hidden sm:flex items-center gap-2">
                  {(newProduct.colors || []).map((c) => (
                    <span
                      key={c}
                      className="h-5 w-5 rounded-full border border-black/20"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => !saving && closeModal()}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-black/10 hover:border-black/30 transition"
                  aria-label="Close"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              {/* Form grid */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600">
                    Name
                  </label>
                  <input
                    name="name"
                    value={newProduct.name || ""}
                    onChange={changeNewProduct}
                    maxLength={30}
                    className="mt-2 w-full border border-black/10 px-3 py-2 text-sm outline-none focus:border-black"
                    placeholder="Name"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600">
                    Brand
                  </label>
                  <input
                    name="brand"
                    value={newProduct.brand || ""}
                    onChange={changeNewProduct}
                    maxLength={15}
                    className="mt-2 w-full border border-black/10 px-3 py-2 text-sm outline-none focus:border-black"
                    placeholder="Brand"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600">
                    Genre
                  </label>
                  <select
                    name="genre"
                    value={newProduct.genre || ""}
                    onChange={(e) =>
                      setNewProduct((prev) => ({ ...prev, genre: e.target.value }))
                    }
                    className="mt-2 w-full border border-black/10 px-3 py-2 text-sm outline-none focus:border-black bg-white"
                  >
                    <option value="" disabled>
                      Select genre
                    </option>
                    {GENRE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600">
                    Type
                  </label>
                  <select
                    name="type"
                    value={newProduct.type || ""}
                    onChange={(e) =>
                      setNewProduct((prev) => ({ ...prev, type: e.target.value }))
                    }
                    className="mt-2 w-full border border-black/10 px-3 py-2 text-sm outline-none focus:border-black bg-white"
                  >
                    <option value="" disabled>
                      Select type
                    </option>
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600">
                    Price (€)
                  </label>
                  <input
                    name="price"
                    value={newProduct.price ?? ""}
                    onChange={checkIfNum}
                    className={`mt-2 w-full border px-3 py-2 text-sm outline-none focus:border-black ${
                      newProduct.price === undefined
                        ? "border-red-400"
                        : "border-black/10"
                    }`}
                    placeholder="Price (€)"
                  />
                  {newProduct.price === undefined && (
                    <p className="mt-1 text-xs text-red-600">Field is not numeric</p>
                  )}
                </div>

                <div className="flex items-end gap-3">
                  <button
                    type="button"
                    disabled={!newProduct.price}
                    onClick={() => {
                      setDiscountOpen((v) => !v);
                      setNewProduct((prev) => ({ ...prev, salesPrice: 0, discount: 0 }));
                    }}
                    className="bg-black text-white px-4 py-2 text-xs font-semibold tracking-[0.22em] uppercase hover:bg-neutral-800 disabled:opacity-40 transition"
                  >
                    Set discount
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveImageAndColor((v) => !v)}
                    className="border border-black/20 px-4 py-2 text-xs font-semibold tracking-[0.22em] uppercase hover:border-black transition"
                  >
                    Add new image
                  </button>

                  {(newProduct.colors || []).length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setNewProduct((prev) => ({
                          ...prev,
                          images: [],
                          colors: [],
                          files: [],
                        }))
                      }
                      className="ml-auto text-xs font-semibold tracking-[0.18em] uppercase text-neutral-600 hover:text-black"
                    >
                      Reset images
                    </button>
                  )}
                </div>
              </div>

              {/* Discount section */}
              {discountOpen && (
                <div className="mt-6 border border-black/10 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600">
                      Discount: {Number(newProduct.discount || 0)}%
                    </div>
                    <div className="text-sm text-black">
                      Sales price:{" "}
                      <span className="font-semibold">
                        {Number(newProduct.salesPrice || 0).toFixed(2)}€
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={Number(newProduct.discount || 0)}
                    onChange={handleChangeDiscountAndPrice}
                    className="mt-3 w-full"
                  />
                </div>
              )}

              {/* New images preview (only images with data) */}
              {newProduct.images?.some((img) => img.data) && (
                <div className="mt-6">
                  <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600">
                    New images to upload
                  </div>

                  <div className="mt-3 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {newProduct.images
                      .filter((image) => image.data)
                      .map((image) => (
                        <div key={image.name} className="relative border border-black/10">
                          <img
                            src={getImageInBase64(image)}
                            alt={image.name}
                            className="h-44 w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() => handleDeleteImage(image)}
                            className="absolute top-2 left-2 inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/90 border border-black/10 hover:border-black/30 transition"
                            aria-label="Delete image"
                            title="Delete image"
                          >
                            <FaTrash size={12} className="text-neutral-800" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Image & color picker (your existing component) */}
              {activeImageAndColor && (
                <div className="mt-8">
                  <ImageAndColorGrid
                    product={newProduct}
                    setProduct={setNewProduct}
                    activeImageAndColor={activeImageAndColor}
                    setActiveImageAndColor={setActiveImageAndColor}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-black/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-neutral-600 hover:text-black disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleEditProduct}
                disabled={!canSave || saving}
                className="bg-black text-white px-6 py-2.5 text-xs font-semibold tracking-[0.22em] uppercase hover:bg-neutral-800 disabled:opacity-40 transition"
              >
                {saving ? "Saving..." : "Edit product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
