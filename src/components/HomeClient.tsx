"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import QrPreview from "@/components/QrPreview";
import StylePicker from "@/components/StylePicker";
import { PRESET_DEFAULT_COLOR, type QrStylePreset } from "@/lib/qr-presets";

type Mode = "static" | "dynamic";

type DynamicResult = {
  slug: string;
  redirectUrl: string;
  editUrl: string;
  name: string;
};

export default function HomeClient() {
  const searchParams = useSearchParams();
  const notFoundError = searchParams.get("error") === "qr-not-found";

  const [mode, setMode] = useState<Mode>("static");
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [preset, setPreset] = useState<QrStylePreset>("basic");
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [dynamicResult, setDynamicResult] = useState<DynamicResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickerColor = customColor ?? PRESET_DEFAULT_COLOR[preset];

  const previewData = useMemo(() => {
    if (mode === "dynamic" && dynamicResult) return dynamicResult.redirectUrl;
    return url;
  }, [mode, dynamicResult, url]);

  async function createDynamicQr() {
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
      setDynamicResult({ slug: json.slug, redirectUrl, editUrl, name: name.trim() });
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function handleModeChange(nextMode: Mode) {
    setMode(nextMode);
    setDynamicResult(null);
    setError(null);
  }

  function handleUrlChange(value: string) {
    setUrl(value);
    setDynamicResult(null);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">QR Styler</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          URL을 입력해 스타일이 적용된 QR코드를 만들고 이미지로 저장하세요.
        </p>
      </header>

      {notFoundError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          존재하지 않는 QR코드입니다.
        </p>
      )}

      <div className="flex gap-2 rounded-full bg-black/5 p-1 text-sm font-medium dark:bg-white/10">
        <button
          type="button"
          onClick={() => handleModeChange("static")}
          className={`flex-1 rounded-full px-4 py-2 transition-colors ${
            mode === "static" ? "bg-white shadow dark:bg-black" : ""
          }`}
        >
          정적 QR
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("dynamic")}
          className={`flex-1 rounded-full px-4 py-2 transition-colors ${
            mode === "dynamic" ? "bg-white shadow dark:bg-black" : ""
          }`}
        >
          동적 QR (URL 변경 가능)
        </button>
      </div>

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
        {mode === "dynamic" && (
          <p className="text-xs text-zinc-500">
            동적 QR은 나중에 이 URL을 바꿔도 같은 QR코드 이미지를 계속 사용할 수 있습니다.
          </p>
        )}
      </div>

      {mode === "dynamic" && (
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
      )}

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

      {mode === "dynamic" && (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={!url || loading}
            onClick={createDynamicQr}
            className="self-start rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black/80 disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-white/80"
          >
            {loading ? "생성 중..." : "동적 QR 만들기"}
          </button>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {dynamicResult && (
            <div className="flex flex-col gap-1 rounded-lg border border-black/10 p-4 text-sm dark:border-white/10">
              <p className="font-medium">
                {dynamicResult.name || "이름 없음"} — 관리 링크 (URL 수정용, 꼭 저장해두세요)
              </p>
              <a
                href={dynamicResult.editUrl}
                className="break-all text-blue-600 underline dark:text-blue-400"
              >
                {dynamicResult.editUrl}
              </a>
            </div>
          )}
        </div>
      )}

      {(mode === "static" ? url : dynamicResult) && (
        <QrPreview data={previewData} preset={preset} color={customColor ?? undefined} />
      )}
    </div>
  );
}
