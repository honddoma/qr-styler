export type QrBackgroundShape = "square" | "circle" | "star" | "heart";

export const QR_BACKGROUND_SHAPES: Record<QrBackgroundShape, string> = {
  square: "없음",
  circle: "원형",
  star: "별",
  heart: "하트",
};

export type ShapeBox = { x: number; y: number; size: number };

type DecorativeShape = Exclude<QrBackgroundShape, "square">;

export function getShapeMarkup(shape: DecorativeShape, size: number, color: string): string {
  switch (shape) {
    case "circle": {
      const r = size / 2;
      return `<circle cx="${r}" cy="${r}" r="${r}" fill="${color}" />`;
    }
    case "star": {
      const cx = size / 2;
      const cy = size / 2;
      const outerR = size * 0.49;
      const innerR = outerR * 0.62;
      const points: string[] = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        points.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`);
      }
      return `<polygon points="${points.join(" ")}" fill="${color}" />`;
    }
    case "heart": {
      const scale = size / 100;
      const d =
        "M50,88 C20,65 0,45 0,25 C0,10 12,0 25,0 C35,0 45,8 50,20 C55,8 65,0 75,0 C88,0 100,10 100,25 C100,45 80,65 50,88 Z";
      return `<path d="${d}" fill="${color}" transform="scale(${scale})" />`;
    }
  }
}

export function getShapeQrBox(shape: DecorativeShape, size: number): ShapeBox {
  switch (shape) {
    case "circle": {
      const boxSize = size * 0.6;
      return { x: (size - boxSize) / 2, y: (size - boxSize) / 2, size: boxSize };
    }
    case "star": {
      const boxSize = size * 0.42;
      return { x: (size - boxSize) / 2, y: (size - boxSize) / 2, size: boxSize };
    }
    case "heart": {
      const boxSize = size * 0.42;
      return { x: (size - boxSize) / 2, y: size * 0.16, size: boxSize };
    }
  }
}
