import React, { useState, useContext } from "react";
import clothesService from "../../service/serviceAPI";
import { UserContext } from "../../contexts/UserContext";
import { useSnackbar } from "notistack";
import { FaTrash } from "react-icons/fa";
import { notify } from "../../utils/notify";

export default function DeleteProductModal({ setClothes, code, name }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { tokenProvider } = useContext(UserContext);
  const [token] = tokenProvider;

  const { enqueueSnackbar } = useSnackbar();

  const handleDeleteProduct = async () => {
    try {
      setSubmitting(true);

      const res = await clothesService().deleteProduct(code, token);

      notify(enqueueSnackbar, res?.msg, res?.status);

      if (res.type === "error") {
        setSubmitting(false);
        return;
      }

      setClothes((prev) => prev.filter((cl) => cl.code !== code));
      setOpen(false);
      setSubmitting(false);
    } catch (err) {
      notify(enqueueSnackbar, err?.message || "Failed to delete product", 400);
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-black/10 bg-white hover:border-black/30 transition"
        aria-label="Delete product"
        title="Delete"
      >
        <FaTrash className="text-neutral-700" size={14} />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <button
            type="button"
            onClick={() => !submitting && setOpen(false)}
            className="absolute inset-0 bg-black/40"
            aria-label="Close delete modal"
          />

          {/* Panel */}
          <div className="relative mx-auto mt-28 w-[92%] max-w-md bg-white border border-black/10 shadow-xl">
            <div className="px-6 py-4 border-b border-black/10">
              <h2 className="text-sm font-semibold tracking-[0.18em] uppercase text-black">
                Delete product
              </h2>
            </div>

            <div className="px-6 py-6">
              <p className="text-sm text-neutral-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-black">{name}</span> ({code})?
              </p>
              <p className="mt-2 text-xs text-neutral-500">
                This action cannot be undone.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-black/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-neutral-600 hover:text-black disabled:opacity-40"
              >
                No
              </button>

              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={submitting}
                className="bg-black text-white px-5 py-2.5 text-xs font-semibold tracking-[0.22em] uppercase hover:bg-neutral-800 disabled:opacity-40 transition"
              >
                {submitting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
