import React, { useMemo, useState, useEffect } from "react";
import clothesService, { resolveProductImage } from "../../service/api-client";
import ImageAndColorGrid from "./ImageAndColorGrid";
import { useSnackbar } from "notistack";
import { FaPen, FaTimes, FaTrash } from "react-icons/fa";
import { notify } from "../../utils/notify";

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

export default function EditProductModal({ product, updateClothes }) {
  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [activeImageAndColor, setActiveImageAndColor] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(() => ({
    name: "",
    brand: "",
    genre: "",
    type: "",
    price: "",
    discount: 0,
    salesPrice: 0,
  }));

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]); // metadata { name,type,color }
  const [newFiles, setNewFiles] = useState([]); // File[]

  useEffect(() => {
    if (!open) return;

    setForm({
      name: product?.name ?? "",
      brand: product?.brand ?? "",
      genre: product?.genre ?? "",
      type: product?.type ?? "",
      price: product?.price ?? "",
      discount: Number(product?.discount ?? 0),
      salesPrice: Number(product?.salesPrice ?? 0),
    });

    setExistingImages(product?.images ?? []);
    setNewImages([]);
    setNewFiles([]);
    setDiscountOpen(false);
    setActiveImageAndColor(false);
    setSaving(false);
  }, [open, product]);

  const colors = useMemo(() => {
    const all = [...(existingImages || []), ...(newImages || [])];
    const set = new Set(all.map((img) => img?.color).filter(Boolean));
    return Array.from(set);
  }, [existingImages, newImages]);

  const priceInvalid = form.price !== "" && Number.isNaN(+form.price);

  const canSave = useMemo(() => {
    const hasImages = (existingImages?.length || 0) + (newImages?.length || 0) > 0;
    return (
      Boolean(form.name) &&
      Boolean(form.type) &&
      Boolean(form.brand) &&
      form.price !== "" &&
      !priceInvalid &&
      Boolean(form.genre) &&
      hasImages
    );
  }, [form, existingImages, newImages, priceInvalid]);

  const closeModal = () => {
    if (saving) return;
    setOpen(false);
  };

  const onChangeField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeDiscountAndPrice = (e) => {
    const discount = Number(e.target.value || 0);
    const price = Number(form.price || 0);
    const salesPrice = Number((price * (1 - discount / 100)).toFixed(2));
    setForm((prev) => ({ ...prev, discount, salesPrice }));
  };

  const handleDeleteExistingImage = (image) => {
    setExistingImages((prev) =>
      prev.filter((img) =>
        image.fileId ? img.fileId !== image.fileId : img.name !== image.name
      )
    );
  };

  const handleDeleteNewAt = (idx) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleResetImages = () => {
    setExistingImages([]);
    setNewImages([]);
    setNewFiles([]);
  };

  const setProductForGrid = (updater) => {
    const prevProductLike = {
      ...product,
      ...form,
      images: [...existingImages, ...newImages],
      colors,
      files: [...newFiles],
    };

    const next = typeof updater === "function" ? updater(prevProductLike) : updater;

    const nextImages = next?.images || [];
    const nextFiles = next?.files || [];

    setExistingImages(nextImages.filter((img) => img?.fileId));
    setNewImages(nextImages.filter((img) => !img?.fileId));
    setNewFiles(nextFiles);
  };

  const handleEditProduct = async () => {
    if (!canSave || saving) return;

    try {
      setSaving(true);

      const productToSend = {
        ...product,
        ...form,
        price: Number(form.price),
        colors,
        images: existingImages,
      };

      const resp = await clothesService().editProduct(productToSend);
      notify(enqueueSnackbar, resp?.msg, resp?.status);

      if (resp?.status >= 400 || resp?.type === "error") {
        setSaving(false);
        return;
      }

      let finalImages = existingImages;
      let finalColors = colors;

      if (newFiles.length > 0) {
        const perFileColors = newImages.map((img) => img.color || null);

        const imgResp = await clothesService().addImageToProduct(
          newFiles,
          perFileColors,
          product.code
        );

        if (imgResp?.status >= 400) {
          notify(enqueueSnackbar, imgResp.msg, imgResp.status);
          setSaving(false);
          return;
        }

        notify(enqueueSnackbar, imgResp.msg, imgResp.status);

        finalImages = imgResp.images ?? [];
        finalColors = imgResp.colors ?? [];
      }

      const finalProductForUI = {
        ...productToSend,
        images: finalImages,
        colors: finalColors,
      };

      updateClothes((prev) => {
        const idx = prev.findIndex((cl) => cl.code === finalProductForUI.code);
        if (idx < 0) return prev;
        const copy = [...prev];
        copy[idx] = finalProductForUI;
        return copy;
      });

      setExistingImages(finalImages);
      setNewImages([]);
      setNewFiles([]);
      setSaving(false);
      setOpen(false);
    } catch (err) {
      notify(enqueueSnackbar, err?.message || "Failed to edit product", 400);
      setSaving(false);
    }
  };

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setNewImages([]);
          setNewFiles([]);
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
            onClick={closeModal}
            className="absolute inset-0 bg-black/40"
            aria-label="Close edit modal"
          />

          {/* Panel */}
          <div className="relative mx-auto mt-10 w-[94%] max-w-3xl max-h-[90vh] flex flex-col bg-white border border-black/10 shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-black/10">
              <div>
                <div className="text-sm font-semibold tracking-[0.18em] uppercase text-black">
                  Edit product
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  Code: <span className="text-neutral-800">{product.code}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Color dots (derived) */}
                <div className="hidden sm:flex items-center gap-2">
                  {colors.map((c) => (
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
                  onClick={closeModal}
                  disabled={saving}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-black/10 hover:border-black/30 transition disabled:opacity-40"
                  aria-label="Close"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6 overflow-y-auto">
              {/* Form grid */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600">
                    Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChangeField}
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
                    value={form.brand}
                    onChange={onChangeField}
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
                    value={form.genre}
                    onChange={onChangeField}
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
                    value={form.type}
                    onChange={onChangeField}
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
                    value={form.price ?? ""}
                    onChange={onChangeField}
                    className={`mt-2 w-full border px-3 py-2 text-sm outline-none focus:border-black ${
                      priceInvalid ? "border-red-400" : "border-black/10"
                    }`}
                    placeholder="Price (€)"
                  />
                  {priceInvalid && (
                    <p className="mt-1 text-xs text-red-600">Field is not numeric</p>
                  )}
                </div>

                <div className="flex items-end gap-3">
                  <button
                    type="button"
                    disabled={!form.price || priceInvalid}
                    onClick={() => {
                      setDiscountOpen((v) => !v);
                      setForm((prev) => ({ ...prev, salesPrice: 0, discount: 0 }));
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

                  {(existingImages.length > 0 || newImages.length > 0) && (
                    <button
                      type="button"
                      onClick={handleResetImages}
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
                      Discount: {Number(form.discount || 0)}%
                    </div>
                    <div className="text-sm text-black">
                      Sales price:{" "}
                      <span className="font-semibold">
                        {Number(form.salesPrice || 0).toFixed(2)}€
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={Number(form.discount || 0)}
                    onChange={handleChangeDiscountAndPrice}
                    className="mt-3 w-full"
                  />
                </div>
              )}

              {/* Existing images */}
              {existingImages.length > 0 && (
                <div className="mt-6">
                  <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600">
                    Existing images
                  </div>

                  <div className="mt-3 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {existingImages.map((image) => (
                      <div key={image.name} className="relative border border-black/10">
                        <img
                          src={resolveProductImage(image)}
                          alt={image.name}
                          className="h-44 w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => handleDeleteExistingImage(image)}
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

              {/* New images preview */}
              {newImages.length > 0 && (
                <div className="mt-6">
                  <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600">
                    New images to upload
                  </div>

                  <div className="mt-3 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {newFiles.map((file, idx) => (
                      <div
                        key={file.name + idx}
                        className="relative border border-black/10"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="h-44 w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => handleDeleteNewAt(idx)}
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

              {/* Image & color picker */}
              {activeImageAndColor && (
                <div className="mt-8">
                  <ImageAndColorGrid
                    setProduct={setProductForGrid}
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
