import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { resolveProductImage } from "../../service/api-client";

export default function ClothesCard({
  cloth,
  handleChangeImageClick,
  wishlist,
  handleWishClick,
  thumbnail,
}) {
  const isWished = wishlist?.some((w) => w.code === cloth.code);

  const img = thumbnail?.currImage || cloth.images?.[0];

  const colors = useMemo(
    () =>
      Array.from(new Set((cloth?.images || []).map((im) => im?.color).filter(Boolean))),
    [cloth]
  );

  return (
    <div className="group">
      <div className="relative overflow-hidden bg-neutral-100">
        <Link to={`/clothes/${cloth.genre}/${cloth.code}`}>
          <img
            src={resolveProductImage(img)}
            alt={cloth.name}
            className="h-90 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        </Link>

        {/* Wishlist button */}
        <button
          type="button"
          onClick={() => handleWishClick(cloth.code)}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white border border-black/10 rounded-full w-10 h-10 flex items-center justify-center shadow-sm"
          aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isWished ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart className="text-black" />
          )}
        </button>
      </div>

      <div className="pt-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.08em] uppercase text-black">
              {cloth.name}
            </p>

            {/* price */}
            <div className="mt-1 flex items-center gap-2 text-sm">
              {cloth.discount ? (
                <>
                  <span className="text-black font-semibold">
                    {cloth.salesPrice.toFixed(2)}€
                  </span>
                  <span className="text-neutral-500 line-through text-xs">
                    {cloth.price.toFixed(2)}€
                  </span>
                </>
              ) : (
                <span className="text-black font-semibold">
                  {cloth.price.toFixed(2)}€
                </span>
              )}
            </div>
          </div>
        </div>

        {/* color dots */}
        <div className="mt-3 flex flex-wrap gap-2">
          {colors?.map((color) => (
            <button
              key={`${cloth.code}-${color}`}
              type="button"
              onClick={() => handleChangeImageClick(cloth, color)}
              className="h-5 w-5 rounded-full border border-black/20 hover:border-black transition"
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
