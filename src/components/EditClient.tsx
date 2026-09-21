"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import QrPreview from "@/components/QrPreview";
import type { QrStylePreset } from "@/lib/qr-presets";
import { buildCenterImage, type CenterDecoration } from "@/lib/center-decoration";

type Status = "loading" | "ready" | "not-found" | "saving" | "saved" | "error";

export default function EditClient({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>(token ? "loading" : "not-found");
  const [targetUrl, setTargetUrl] = useState("");
  const [name, setName] = useState("");
  const [preset, setPreset] = useState<QrStylePreset>("basic");
  const [color, setColor] = useState<string | undefined>(undefined);
  const [centerDecoration, setCenterDecoration] = useState<CenterDecoration>("none");
  const [centerText, setCenterText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState("");

  const centerImage = useMemo(
    () => buildCenterImage(centerDecoration, centerText, color ?? "#111111"),
    [centerDecoration, centerText, color]
  );

  useEffect(() => {
    if (!token) return;
    fetch(`/api/qr/${slug}?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          setStatus("not-found");
          return;
        }
        const json = await res.json();
        setRedirectUrl(`${window.location.origin}/q/${slug}`);
        setTargetUrl(json.targetUrl);
        setName(json.name ?? "");
        setPreset((json.preset as QrStylePreset) ?? "basic");
        setColor(json.color ?? undefined);
        setCenterDecoration((json.centerDecoration as CenterDecoration) ?? "none");
        setCenterText(json.centerText ?? "");
        setStatus("ready");
      })
      .catch(() => setStatus("not-found"));
  }, [slug, token]);

  useEffect(() => {
    document.title = name ? `${name} - QR Styler 관리` : "QR코드 관리 - QR Styler";
  }, [name]);

  async function handleSave() {
    if (!token) return;
    setStatus("saving");
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/qr/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, targetUrl, name: name.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(json.error ?? "저장하지 못했습니다.");
        setStatus("ready");
        return;
      }
      setStatus("saved");
    } catch {
      setErrorMessage("네트워크 오류가 발생했습니다.");
      setStatus("ready");
    }
  }

  if (status === "loading") {
    return <p className="px-6 py-16 text-center text-sm text-zinc-500">불러오는 중...</p>;
  }

  if (status === "not-found") {
    return (
      <p className="px-6 py-16 text-center text-sm text-red-600 dark:text-red-400">
        관리 링크가 올바르지 않거나 만료되었습니다.
      </p>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {name ? `${name} 관리` : "QR코드 URL 수정"}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          QR코드 이미지는 그대로 두고 연결되는 URL만 바꿀 수 있습니다.
        </p>
      </header>

      {redirectUrl && (
        <QrPreview data={redirectUrl} preset={preset} color={color} centerImage={centerImage} size={200} />
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="qr-name" className="text-sm font-medium">
          이름 (선택)
        </label>
        <input
          id="qr-name"
          type="text"
          placeholder="예: 명함용, 포스터용"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={60}
          className="rounded-lg border border-black/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-black dark:border-white/20 dark:focus:border-white"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="target-url" className="text-sm font-medium">
          새 URL
        </label>
        <input
          id="target-url"
          type="text"
          value={targetUrl}
          onChange={(event) => setTargetUrl(event.target.value)}
          className="rounded-lg border border-black/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-black dark:border-white/20 dark:focus:border-white"
        />
      </div>

      {errorMessage && <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>}
      {status === "saved" && (
        <p className="text-sm text-green-600 dark:text-green-400">저장되었습니다.</p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={status === "saving" || !targetUrl}
        className="self-start rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black/80 disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-white/80"
      >
        {status === "saving" ? "저장 중..." : "저장"}
      </button>
    </div>
  );
}
