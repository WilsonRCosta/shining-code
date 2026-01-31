import colorName from "color-name";
import { differenceCiede2000, lab, rgb } from "culori";

/* ---------- helpers ---------- */

const rgb255ToRgb = ({ r, g, b }) => rgb({ r: r / 255, g: g / 255, b: b / 255 });

const hexToRgb255 = (hex) => {
  if (!hex) return null;
  let s = String(hex).trim().replace(/^#/, "");

  if (s.length === 3)
    s = s
      .split("")
      .map((c) => c + c)
      .join("");
  if (s.length === 8) s = s.slice(0, 6);
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;

  return {
    r: parseInt(s.slice(0, 2), 16),
    g: parseInt(s.slice(2, 4), 16),
    b: parseInt(s.slice(4, 6), 16),
  };
};

/* ---------- PRECOMPUTE LAB ---------- */

const CSS_NAMED = Object.entries(colorName).map(([name, [r, g, b]]) => ({
  name,
  lab: lab(rgb255ToRgb({ r, g, b })),
}));

/* ---------- MAIN ---------- */

export const getClosestColor = (hex, { topN = 5 } = {}) => {
  const rgb255 = hexToRgb255(hex);
  if (!rgb255) return { ok: false, best: null, top: [] };

  const inputLab = lab(rgb255ToRgb(rgb255));

  const deltaE = differenceCiede2000();

  const scored = CSS_NAMED.map((c) => ({
    name: c.name,
    dE: deltaE(inputLab, c.lab),
  })).sort((a, b) => a.dE - b.dE);

  return {
    ok: true,
    hex: `#${hex.replace(/^#/, "").toUpperCase()}`,
    best: scored[0],
    top: scored.slice(0, topN),
  };
};
