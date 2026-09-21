"use client";

import { useEffect, useState } from "react";
import { buildQrOptions, type QrStylePreset } from "@/lib/qr-presets";
import { getShapeMarkup, getShapeQrBox, type QrBackgroundShape } from "@/lib/shapes";

type DecorativeShape = Exclude<QrBackgroundShape, "square">;

type ShapedQrPreviewProps = {
  data: string;
  preset: QrStylePreset;
  color: string;
  shape: DecorativeShape;
  size?: number;
};

async function buildComposedSvg(
  data: string,
  preset: QrStylePreset,
  color: string,
  shape: DecorativeShape,
  size: number
): Promise<string> {
  const { default: QRCodeStyling } = await import("qr-code-styling");
  const box = getShapeQrBox(shape, size);
  const qr = new QRCodeStyling(buildQrOptions(data, preset, Math.round(box.size), color));
  const raw = await qr.getRawData("svg");
  if (!raw || !(raw instanceof Blob)) {
    throw new Error("QR SVG를 생성하지 못했습니다.");
  }
  const text = await raw.text();
  const inner = new DOMParser().parseFromString(text, "image/svg+xml").documentElement;
  inner.setAttribute("x", String(box.x));
  inner.setAttribute("y", String(box.y));
  inner.setAttribute("width", String(box.size));
  inner.setAttribute("height", String(box.size));
  const innerMarkup = new XMLSerializer().serializeToString(inner);
  const shapeMarkup = getShapeMarkup(shape, size, color);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="white" />${shapeMarkup}${innerMarkup}</svg>`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ShapedQrPreview({ data, preset, color, shape, size = 260 }: ShapedQrPreviewProps) {
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    buildComposedSvg(data || " ", preset, color, shape, size).then((markup) => {
      if (!cancelled) setSvgMarkup(markup);
    });
    return () => {
      cancelled = true;
    };
  }, [data, preset, color, shape, size]);

  async function download(extension: "png" | "svg") {
    if (!svgMarkup) return;
    if (extension === "svg") {
      triggerDownload(new Blob([svgMarkup], { type: "image/svg+xml" }), "qr-code.svg");
      return;
    }

    const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      const scale = 3;
      const canvas = document.createElement("canvas");
      canvas.width = size * scale;
      canvas.height = size * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (pngBlob) triggerDownload(pngBlob, "qr-code.png");
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="flex items-center justify-center overflow-hidden rounded-2xl border border-black/10 shadow-sm dark:border-white/10"
        style={{ width: size, height: size }}
        dangerouslySetInnerHTML={{ __html: svgMarkup ?? "" }}
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
