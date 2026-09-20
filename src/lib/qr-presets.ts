import type { Options as QrStylingOptions } from "qr-code-styling";

export type QrStylePreset = "basic" | "rounded" | "fancy";

export const QR_STYLE_PRESETS: Record<QrStylePreset, string> = {
  basic: "기본",
  rounded: "둥근 버전",
  fancy: "이쁜 도형",
};

type PresetOptions = Pick<
  QrStylingOptions,
  "dotsOptions" | "cornersSquareOptions" | "cornersDotOptions" | "backgroundOptions"
>;

export function getPresetOptions(preset: QrStylePreset): PresetOptions {
  switch (preset) {
    case "basic":
      return {
        dotsOptions: { type: "square", color: "#111111" },
        cornersSquareOptions: { type: "square", color: "#111111" },
        cornersDotOptions: { type: "square", color: "#111111" },
        backgroundOptions: { color: "#ffffff" },
      };
    case "rounded":
      return {
        dotsOptions: { type: "rounded", color: "#1d4ed8" },
        cornersSquareOptions: { type: "extra-rounded", color: "#1d4ed8" },
        cornersDotOptions: { type: "dot", color: "#1d4ed8" },
        backgroundOptions: { color: "#ffffff" },
      };
    case "fancy":
      return {
        dotsOptions: {
          type: "classy-rounded",
          gradient: {
            type: "linear",
            rotation: 45,
            colorStops: [
              { offset: 0, color: "#7c3aed" },
              { offset: 1, color: "#ec4899" },
            ],
          },
        },
        cornersSquareOptions: { type: "dot", color: "#7c3aed" },
        cornersDotOptions: { type: "dot", color: "#ec4899" },
        backgroundOptions: { color: "#ffffff" },
      };
  }
}

export function buildQrOptions(
  data: string,
  preset: QrStylePreset,
  size = 300
): QrStylingOptions {
  const presetOptions = getPresetOptions(preset);
  return {
    width: size,
    height: size,
    type: "svg",
    data,
    margin: 8,
    qrOptions: { errorCorrectionLevel: "Q" },
    imageOptions: { crossOrigin: "anonymous", margin: 8 },
    ...presetOptions,
  };
}
