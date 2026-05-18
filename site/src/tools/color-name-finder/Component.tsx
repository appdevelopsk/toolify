"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

// CSS4 named colors [name, r, g, b]
const NAMED_COLORS: [string, number, number, number][] = [
  ["aliceblue", 240, 248, 255], ["antiquewhite", 250, 235, 215], ["aqua", 0, 255, 255],
  ["aquamarine", 127, 255, 212], ["azure", 240, 255, 255], ["beige", 245, 245, 220],
  ["bisque", 255, 228, 196], ["black", 0, 0, 0], ["blanchedalmond", 255, 235, 205],
  ["blue", 0, 0, 255], ["blueviolet", 138, 43, 226], ["brown", 165, 42, 42],
  ["burlywood", 222, 184, 135], ["cadetblue", 95, 158, 160], ["chartreuse", 127, 255, 0],
  ["chocolate", 210, 105, 30], ["coral", 255, 127, 80], ["cornflowerblue", 100, 149, 237],
  ["cornsilk", 255, 248, 220], ["crimson", 220, 20, 60], ["cyan", 0, 255, 255],
  ["darkblue", 0, 0, 139], ["darkcyan", 0, 139, 139], ["darkgoldenrod", 184, 134, 11],
  ["darkgray", 169, 169, 169], ["darkgreen", 0, 100, 0], ["darkkhaki", 189, 183, 107],
  ["darkmagenta", 139, 0, 139], ["darkolivegreen", 85, 107, 47], ["darkorange", 255, 140, 0],
  ["darkorchid", 153, 50, 204], ["darkred", 139, 0, 0], ["darksalmon", 233, 150, 122],
  ["darkseagreen", 143, 188, 143], ["darkslateblue", 72, 61, 139], ["darkslategray", 47, 79, 79],
  ["darkturquoise", 0, 206, 209], ["darkviolet", 148, 0, 211], ["deeppink", 255, 20, 147],
  ["deepskyblue", 0, 191, 255], ["dimgray", 105, 105, 105], ["dodgerblue", 30, 144, 255],
  ["firebrick", 178, 34, 34], ["floralwhite", 255, 250, 240], ["forestgreen", 34, 139, 34],
  ["fuchsia", 255, 0, 255], ["gainsboro", 220, 220, 220], ["ghostwhite", 248, 248, 255],
  ["gold", 255, 215, 0], ["goldenrod", 218, 165, 32], ["gray", 128, 128, 128],
  ["green", 0, 128, 0], ["greenyellow", 173, 255, 47], ["honeydew", 240, 255, 240],
  ["hotpink", 255, 105, 180], ["indianred", 205, 92, 92], ["indigo", 75, 0, 130],
  ["ivory", 255, 255, 240], ["khaki", 240, 230, 140], ["lavender", 230, 230, 250],
  ["lavenderblush", 255, 240, 245], ["lawngreen", 124, 252, 0], ["lemonchiffon", 255, 250, 205],
  ["lightblue", 173, 216, 230], ["lightcoral", 240, 128, 128], ["lightcyan", 224, 255, 255],
  ["lightgoldenrodyellow", 250, 250, 210], ["lightgray", 211, 211, 211], ["lightgreen", 144, 238, 144],
  ["lightpink", 255, 182, 193], ["lightsalmon", 255, 160, 122], ["lightseagreen", 32, 178, 170],
  ["lightskyblue", 135, 206, 250], ["lightslategray", 119, 136, 153], ["lightsteelblue", 176, 196, 222],
  ["lightyellow", 255, 255, 224], ["lime", 0, 255, 0], ["limegreen", 50, 205, 50],
  ["linen", 250, 240, 230], ["magenta", 255, 0, 255], ["maroon", 128, 0, 0],
  ["mediumaquamarine", 102, 205, 170], ["mediumblue", 0, 0, 205], ["mediumorchid", 186, 85, 211],
  ["mediumpurple", 147, 112, 219], ["mediumseagreen", 60, 179, 113], ["mediumslateblue", 123, 104, 238],
  ["mediumspringgreen", 0, 250, 154], ["mediumturquoise", 72, 209, 204], ["mediumvioletred", 199, 21, 133],
  ["midnightblue", 25, 25, 112], ["mintcream", 245, 255, 250], ["mistyrose", 255, 228, 225],
  ["moccasin", 255, 228, 181], ["navajowhite", 255, 222, 173], ["navy", 0, 0, 128],
  ["oldlace", 253, 245, 230], ["olive", 128, 128, 0], ["olivedrab", 107, 142, 35],
  ["orange", 255, 165, 0], ["orangered", 255, 69, 0], ["orchid", 218, 112, 214],
  ["palegoldenrod", 238, 232, 170], ["palegreen", 152, 251, 152], ["paleturquoise", 175, 238, 238],
  ["palevioletred", 219, 112, 147], ["papayawhip", 255, 239, 213], ["peachpuff", 255, 218, 185],
  ["peru", 205, 133, 63], ["pink", 255, 192, 203], ["plum", 221, 160, 221],
  ["powderblue", 176, 224, 230], ["purple", 128, 0, 128], ["rebeccapurple", 102, 51, 153],
  ["red", 255, 0, 0], ["rosybrown", 188, 143, 143], ["royalblue", 65, 105, 225],
  ["saddlebrown", 139, 69, 19], ["salmon", 250, 128, 114], ["sandybrown", 244, 164, 96],
  ["seagreen", 46, 139, 87], ["seashell", 255, 245, 238], ["sienna", 160, 82, 45],
  ["silver", 192, 192, 192], ["skyblue", 135, 206, 235], ["slateblue", 106, 90, 205],
  ["slategray", 112, 128, 144], ["snow", 255, 250, 250], ["springgreen", 0, 255, 127],
  ["steelblue", 70, 130, 180], ["tan", 210, 180, 140], ["teal", 0, 128, 128],
  ["thistle", 216, 191, 216], ["tomato", 255, 99, 71], ["turquoise", 64, 224, 208],
  ["violet", 238, 130, 238], ["wheat", 245, 222, 179], ["white", 255, 255, 255],
  ["whitesmoke", 245, 245, 245], ["yellow", 255, 255, 0], ["yellowgreen", 154, 205, 50],
];

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().replace(/^#/, "").match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[0]!;
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  // Perceptual weighting
  const rMean = (r1 + r2) / 2;
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return Math.sqrt(
    (2 + rMean / 256) * dr * dr +
    4 * dg * dg +
    (2 + (255 - rMean) / 256) * db * db
  );
}

interface Match {
  name: string;
  hex: string;
  rgb: [number, number, number];
  distance: number;
}

function findNearest(r: number, g: number, b: number, top = 5): Match[] {
  return NAMED_COLORS
    .map(([name, nr, ng, nb]) => ({
      name,
      hex: rgbToHex(nr, ng, nb),
      rgb: [nr, ng, nb] as [number, number, number],
      distance: colorDistance(r, g, b, nr, ng, nb),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, top);
}

export default function ColorNameFinder() {
  const t = useTranslations("tools.color-name-finder");
  const [hexInput, setHexInput] = useState("#3B82F6");
  const [pickerValue, setPickerValue] = useState("#3B82F6");

  const rgb = useMemo(() => hexToRgb(hexInput), [hexInput]);
  const matches = useMemo(() => {
    if (!rgb) return [];
    return findNearest(rgb[0], rgb[1], rgb[2]);
  }, [rgb]);

  const isExact = matches[0]?.distance === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("input.picker")}
          </span>
          <input
            type="color"
            value={pickerValue}
            onChange={(e) => {
              setPickerValue(e.target.value);
              setHexInput(e.target.value);
            }}
            className="h-10 w-12 cursor-pointer rounded border border-slate-300 dark:border-slate-700"
          />
        </label>
        <label className="block flex-1">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("input.hex")}
          </span>
          <input
            value={hexInput}
            onChange={(e) => {
              setHexInput(e.target.value);
              const parsed = hexToRgb(e.target.value);
              if (parsed) setPickerValue(rgbToHex(...parsed));
            }}
            placeholder="#3B82F6"
            className="w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      {!rgb && hexInput.length > 0 && (
        <p className="text-sm text-red-600 dark:text-red-400">{t("error.invalid")}</p>
      )}

      {rgb && matches.length > 0 && (
        <div aria-live="polite" className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isExact ? t("result.exact") : t("result.nearest")}
          </p>
          <div className="space-y-2">
            {matches.map((m, i) => (
              <div
                key={m.name}
                className={
                  "flex items-center gap-3 rounded border px-3 py-2 " +
                  (i === 0
                    ? "border-brand-300 bg-brand-50 dark:border-brand-700 dark:bg-brand-900/20"
                    : "border-slate-200 dark:border-slate-800")
                }
              >
                <div
                  className="h-8 w-8 shrink-0 rounded border border-slate-300 dark:border-slate-700"
                  style={{ backgroundColor: m.hex }}
                />
                <div className="flex-1">
                  <span className="font-mono text-sm font-semibold">{m.name}</span>
                  <span className="ml-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {m.hex.toUpperCase()}
                  </span>
                </div>
                {m.distance > 0 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Δ {Math.round(m.distance)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
