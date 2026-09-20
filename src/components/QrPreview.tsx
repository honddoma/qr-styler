"use client";

import { useEffect, useRef } from "react";
import type QRCodeStyling from "qr-code-styling";
import { buildQrOptions, type QrStylePreset } from "@/lib/qr-presets";

type QrPreviewProps = {
  data: string;
  preset: QrStylePreset;
  size?: number;
};

export default function QrPreview({ data, preset, size = 260 }: QrPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function ensureInstance() {
      if (qrRef.current || !containerRef.current) return;
      const { default: QRCodeStyling } = await import("qr-code-styling");
      if (cancelled || !containerRef.current) return;
      qrRef.current = new QRCodeStyling(buildQrOptions(data || " ", preset, size));
      qrRef.current.append(containerRef.current);
    }

    ensureInstance();
    return () => {
      cancelled = true;
    };
  }, [data, preset, size]);

  useEffect(() => {
    if (!qrRef.current) return;
    qrRef.current.update(buildQrOptions(data || " ", preset, size));
  }, [data, preset, size]);

  async function download(extension: "png" | "svg") {
    if (!qrRef.current) return;
    await qrRef.current.download({ name: "qr-code", extension });
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={containerRef}
        className="flex items-center justify-center rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10"
        style={{ width: size + 32, height: size + 32 }}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => download("png")}
          className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          PNG 저장
        </button>
        <button
          type="button"
          onClick={() => download("svg")}
          className="rounded-full border border-black/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
        >
          SVG 저장
        </button>
      </div>
    </div>
  );
}
