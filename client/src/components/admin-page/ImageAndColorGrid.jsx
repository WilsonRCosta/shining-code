import React, { useMemo, useState } from "react";
import { SketchPicker } from "react-color";
import { FilePond, registerPlugin } from "react-filepond";

import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";

import "./styles.css";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { getClosestColor } from "../../utils/color-utils";

registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType
);

export default function ProductImageAndColor({
  setProduct,
  activeImageAndColor,
  setActiveImageAndColor,
}) {
  const [currColor, setCurrColor] = useState("");
  const [currFiles, setCurrFiles] = useState([]);

  const colorLabel = useMemo(() => {
    if (!currColor) return "UNKNOWN COLOR";

    const res = getClosestColor(currColor);
    if (!res.ok || !res.best) return "UNKNOWN COLOR";

    return res.best.name.toUpperCase();
  }, [currColor]);

  const showPicker = currFiles.length > 0;

  const canConfirm = useMemo(() => {
    return currFiles.length > 0 && Boolean(currColor);
  }, [currFiles.length, currColor]);

  const handleFiles = (filepondItems) => {
    setCurrFiles(filepondItems.map((item) => item.file));
    if (filepondItems.length === 0) setCurrColor("");
  };

  const addImageAndColorToArray = () => {
    if (!canConfirm) return;

    const newImages = currFiles.map((image) => ({
      type: image.name.slice(image.name.lastIndexOf(".") + 1),
      color: currColor,
    }));

    setProduct((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...newImages],
      files: [...(prev.files || []), ...currFiles],
    }));

    setActiveImageAndColor(!activeImageAndColor);
    setCurrFiles([]);
    setCurrColor("");
  };

  return (
    <div className="w-full">
      <div className={`grid gap-6 ${showPicker ? "md:grid-cols-2" : "grid-cols-1"}`}>
        {/* Upload */}
        <div className="border border-black/10 p-4">
          <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600 mb-3">
            Upload images
          </div>

          <FilePond
            allowFileTypeValidation
            acceptedFileTypes={["image/*"]}
            labelFileTypeNotAllowed="File is not an image."
            fileValidateTypeLabelExpectedTypes={""}
            files={currFiles}
            onupdatefiles={handleFiles}
            allowMultiple={true}
            maxFiles={5}
            labelIdle={'Upload images <span class="filepond--label-action">here</span>'}
          />
        </div>

        {/* Color picker */}
        {showPicker && (
          <div className="border border-black/10 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600">
                Choose product color
              </div>
            </div>

            <div className="mt-4">
              <SketchPicker
                disableAlpha
                color={currColor}
                onChange={(color) => setCurrColor(color.hex)}
              />
            </div>

            {currColor && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-neutral-600">Selected</span>
                <span
                  className="h-5 w-5 rounded-full border border-black/20"
                  style={{ backgroundColor: currColor }}
                  title={currColor}
                />
                <span className="text-xs font-semibold text-black">{colorLabel}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirm */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={addImageAndColorToArray}
          disabled={!canConfirm}
          className="bg-black text-white px-6 py-3 text-xs font-semibold tracking-[0.22em] uppercase hover:bg-neutral-800 disabled:opacity-40 transition"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
