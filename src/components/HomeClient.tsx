"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import QrPreview from "@/components/QrPreview";
import ShapedQrPreview from "@/components/ShapedQrPreview";
import StylePicker from "@/components/StylePicker";
import { PRESET_DEFAULT_COLOR, type QrStylePreset } from "@/lib/qr-presets";
import { QR_BACKGROUND_SHAPES, type QrBackgroundShape } from "@/lib/shapes";

type QrResult = {
  slug: string;
  redirectUrl: string;
  editUrl: string;
  name: string;
};

export default function HomeClient() {
  const searchParams = useSearchParams();
  const notFoundError = searchParams.get("error") === "qr-not-found";

  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [preset, setPreset] = useState<QrStylePreset>("basic");
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [shape, setShape] = useState<QrBackgroundShape>("square");
  const [result, setResult] = useState<QrResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickerColor = customColor ?? PRESET_DEFAULT_COLOR[preset];

  async function createQr() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUrl: url,
          preset,
          color: customColor ?? undefined,
          name: name.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "생성에 실패했습니다.");
        return;
      }
      const redirectUrl = `${window.location.origin}/q/${json.slug}`;
      const editUrl = `${window.location.origin}/edit/${json.slug}?token=${json.editToken}`;
      setResult({ slug: json.slug, redirectUrl, editUrl, name: name.trim() });
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function handleUrlChange(value: string) {
    setUrl(value);
    setResult(null);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">QR 만들기</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          URL을 입력해 쪼삣한 QR코드를 만들고 이미지로 저장하세요
        </p>
      </header>

      {notFoundError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          존재하지 않는 QR코드입니다.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="url" className="text-sm font-medium">
          연결할 URL
        </label>
        <input
          id="url"
          type="text"
          placeholder="https://example.com"
          value={url}
          onChange={(event) => handleUrlChange(event.target.value)}
          className="rounded-lg border border-black/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-black dark:border-white/20 dark:focus:border-white"
        />
        <p className="text-xs text-zinc-500">
          생성 후 나오는 관리 링크를 저장해두면, 나중에 URL이 바뀌어도 같은 QR코드 이미지를 계속 사용할 수 있습니다.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium">
          이름 (선택)
        </label>
        <input
          id="name"
          type="text"
          placeholder="예: 명함용, 포스터용"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={60}
          className="rounded-lg border border-black/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-black dark:border-white/20 dark:focus:border-white"
        />
        <p className="text-xs text-zinc-500">
          여러 개를 만들 때 관리 링크를 구분하기 쉽도록 이름을 붙여두세요.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">스타일</span>
        <StylePicker value={preset} onChange={setPreset} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">색상</span>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={pickerColor}
            onChange={(event) => setCustomColor(event.target.value)}
            className="h-10 w-14 cursor-pointer rounded-lg border border-black/15 bg-transparent dark:border-white/20"
            aria-label="QR 색상 선택"
          />
          <span className="text-sm text-zinc-500">{pickerColor}</span>
          {customColor && (
            <button
              type="button"
              onClick={() => setCustomColor(null)}
              className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              기본 색상으로
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">배경 모양</span>
        <div className="flex gap-2">
          {(Object.keys(QR_BACKGROUND_SHAPES) as QrBackgroundShape[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setShape(option)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                shape === option
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "border border-black/15 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
              }`}
            >
              {QR_BACKGROUND_SHAPES[option]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          disabled={!url || loading}
          onClick={createQr}
          className="self-start rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black/80 disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          {loading ? "생성 중..." : "QR 만들기"}
        </button>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {result && (
          <div className="flex flex-col gap-1 rounded-lg border border-black/10 p-4 text-sm dark:border-white/10">
            <p className="font-medium">
              {result.name || "이름 없음"} — 관리 링크 (URL 수정용, 꼭 저장해두세요)
            </p>
            <a
              href={result.editUrl}
              className="break-all text-blue-600 underline dark:text-blue-400"
            >
              {result.editUrl}
            </a>
          </div>
        )}
      </div>

      {result && shape === "square" && (
        <QrPreview data={result.redirectUrl} preset={preset} color={customColor ?? undefined} />
      )}
      {result && shape !== "square" && (
        <ShapedQrPreview data={result.redirectUrl} preset={preset} color={pickerColor} shape={shape} />
      )}
    </div>
  );
}
