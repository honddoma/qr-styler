"use client";

import { useEffect, useRef } from "react";
import type QRCodeStyling from "qr-code-styling";
import { buildQrOptions, type QrStylePreset } from "@/lib/qr-presets";

export default function QrThumbnail({ preset }: { preset: QrStylePreset }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!containerRef.current) return;
      const { default: QRCodeStyling } = await import("qr-code-styling");
      if (cancelled || !containerRef.current) return;
      qrRef.current = new QRCodeStyling(buildQrOptions("https://example.com", preset, 72));
      qrRef.current.append(containerRef.current);
    })();
    return () => {
      cancelled = true;
    };
  }, [preset]);

  return <div ref={containerRef} className="h-[72px] w-[72px]" />;
}
