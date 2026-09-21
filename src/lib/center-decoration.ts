export type CenterDecoration = "none" | "heart" | "text";

export const CENTER_DECORATIONS: Record<CenterDecoration, string> = {
  none: "없음",
  heart: "하트 구멍",
  text: "텍스트",
};

const HEART_PATH =
  "M50,88 C20,65 0,45 0,25 C0,10 12,0 25,0 C35,0 45,8 50,20 C55,8 65,0 75,0 C88,0 100,10 100,25 C100,45 80,65 50,88 Z";

export function buildCenterImage(
  decoration: CenterDecoration,
  text: string,
  color: string
): string | undefined {
  if (decoration === "heart") {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="88" viewBox="0 0 100 88"><path d="${HEART_PATH}" fill="#ffffff" /></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (decoration === "text") {
    const label = text.trim().slice(0, 8) || "QR";
    const textWidth = Math.max(60, label.length * 26 + 16);
    const padding = 24;
    const width = textWidth + padding * 2;
    const height = 52 + padding * 2;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#ffffff" /><text x="${
      width / 2
    }" y="${
      height / 2 + 10
    }" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="28" fill="${color}" text-anchor="middle">${escapeXml(
      label
    )}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  return undefined;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
