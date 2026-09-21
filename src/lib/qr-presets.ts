import type { Options as QrStylingOptions } from "qr-code-styling";

export type QrStylePreset = "basic" | "rounded" | "fancy";

export const QR_STYLE_PRESETS: Record<QrStylePreset, string> = {
  basic: "기본",
  rounded: "둥근 버전",
  fancy: "이쁜 도형",
};

export const PRESET_DEFAULT_COLOR: Record<QrStylePreset, string> = {
  basic: "#111111",
  rounded: "#1d4ed8",
  fancy: "#7c3aed",
};

type DotType = NonNullable<NonNullable<QrStylingOptions["dotsOptions"]>["type"]>;
type CornerSquareType = NonNullable<NonNullable<QrStylingOptions["cornersSquareOptions"]>["type"]>;
type CornerDotType = NonNullable<NonNullable<QrStylingOptions["cornersDotOptions"]>["type"]>;

const PRESET_SHAPES: Record<
  QrStylePreset,
  { dots: DotType; cornersSquare: CornerSquareType; cornersDot: CornerDotType }
> = {
  basic: { dots: "square", cornersSquare: "square", cornersDot: "square" },
  rounded: { dots: "rounded", cornersSquare: "extra-rounded", cornersDot: "dot" },
  fancy: { dots: "classy-rounded", cornersSquare: "dot", cornersDot: "dot" },
};

type PresetOptions = Pick<
  QrStylingOptions,
  "dotsOptions" | "cornersSquareOptions" | "cornersDotOptions" | "backgroundOptions"
>;

export function getPresetOptions(preset: QrStylePreset, color?: string): PresetOptions {
  const shape = PRESET_SHAPES[preset];

  if (!color && preset === "fancy") {
    return {
      dotsOptions: {
        type: shape.dots,
        gradient: {
          type: "linear",
          rotation: 45,
          colorStops: [
            { offset: 0, color: "#7c3aed" },
            { offset: 1, color: "#ec4899" },
          ],
        },
      },
      cornersSquareOptions: { type: shape.cornersSquare, color: "#7c3aed" },
      cornersDotOptions: { type: shape.cornersDot, color: "#ec4899" },
      backgroundOptions: { color: "#ffffff" },
    };
  }

  const finalColor = color ?? PRESET_DEFAULT_COLOR[preset];
  return {
    dotsOptions: { type: shape.dots, color: finalColor },
    cornersSquareOptions: { type: shape.cornersSquare, color: finalColor },
    cornersDotOptions: { type: shape.cornersDot, color: finalColor },
    backgroundOptions: { color: "#ffffff" },
  };
}

export function buildQrOptions(
  data: string,
  preset: QrStylePreset,
  size = 300,
  color?: string
): QrStylingOptions {
  const presetOptions = getPresetOptions(preset, color);
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
