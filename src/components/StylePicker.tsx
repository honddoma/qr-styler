"use client";

import { QR_STYLE_PRESETS, type QrStylePreset } from "@/lib/qr-presets";
import QrThumbnail from "./QrThumbnail";

type StylePickerProps = {
  value: QrStylePreset;
  onChange: (preset: QrStylePreset) => void;
};

export default function StylePicker({ value, onChange }: StylePickerProps) {
  return (
    <div className="flex gap-3">
      {(Object.keys(QR_STYLE_PRESETS) as QrStylePreset[]).map((preset) => (
        <button
          key={preset}
          type="button"
          onClick={() => onChange(preset)}
          className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors ${
            value === preset
              ? "border-black bg-black/5 dark:border-white dark:bg-white/10"
              : "border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
          }`}
        >
          <QrThumbnail preset={preset} />
          <span className="text-xs font-medium">{QR_STYLE_PRESETS[preset]}</span>
        </button>
      ))}
    </div>
  );
}
