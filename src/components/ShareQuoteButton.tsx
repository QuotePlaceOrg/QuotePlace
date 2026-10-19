"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { isFavourite, toggleFavourite } from "@/lib/favorites";
import { createSubmission, incrementQuoteCounter } from "@/lib/db";

// ---------------------------------------------------------------------------
// Canvas quote-image renderer (Quote Place brand theme).
// 1080x1080 PNG, parchment/ink/teal/copper, serif type. Text is drawn with code —
// never AI-generated — so the quote is pixel-perfect.
// ---------------------------------------------------------------------------

type Variant = "light" | "dark" | "parchment";

const PALETTES: Record<Variant, { bg: string; text: string; muted: string; rule: string; frame: string }> = {
  light: { bg: "#FFFFFF", text: "#1A1815", muted: "#6B6459", rule: "#B87333", frame: "#E5E5E0" },
  dark: { bg: "#0F3D3E", text: "#FFFFFF", muted: "#C9C2B4", rule: "#B87333", frame: "#1D5A58" },
  parchment: { bg: "#EFE3CB", text: "#2A2118", muted: "#6B6459", rule: "#B87333", frame: "#D8CBA8" },
};

const BRAND_MARK = "QUOTE PLACE";
const BRAND_SLUG = "quote-place";

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const trial = line ? `${line} ${word}` : word;
    if (ctx.measureText(trial).width <= maxWidth) {
      line = trial;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length > 0 ? lines : [""];
}

async function drawQuoteImage(
  input: { text: string; authorName: string; source: string },
  variant: Variant,
): Promise<Blob> {
  if (!input.text.trim()) throw new Error("image-generation-failed");
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("image-generation-failed");
  const p = PALETTES[variant];

  // Background + hairline frame (double rule for parchment).
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = p.frame;
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, W - 96, H - 96);
  if (variant === "parchment") {
    ctx.lineWidth = 1;
    ctx.strokeRect(60, 60, W - 120, H - 120);
  }

  // Brand mark, top-center, letterspaced.
  ctx.fillStyle = p.muted;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.letterSpacing = "6px";
  ctx.font = "500 24px 'Playfair Display', Georgia, serif";
  ctx.fillText(BRAND_MARK, W / 2, 112);
  ctx.letterSpacing = "0px";

  // Quote text — wrap, then shrink in 2px steps to a 30px floor, then
  // truncate the last visible line with … . Never overflow, never clip.
  const maxWidth = W - 240;
  const quoteTop = 210;
  const quoteBottom = 860;
  const availHeight = quoteBottom - quoteTop;
  let size = 64;
  let lines: string[] = [];
  let lineHeight = 0;
  while (size >= 30) {
    ctx.font = `600 ${size}px 'Playfair Display', Georgia, serif`;
    lineHeight = size * 1.3;
    lines = wrapText(ctx, input.text, maxWidth);
    if (lines.length * lineHeight <= availHeight) break;
    size -= 2;
  }
  const maxLines = Math.max(1, Math.floor(availHeight / lineHeight));
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    let last = lines[lines.length - 1];
    while (last.length > 0 && ctx.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    lines[lines.length - 1] = `${last}…`;
  }
  ctx.fillStyle = p.text;
  const blockHeight = lines.length * lineHeight;
  const startY = quoteTop + (availHeight - blockHeight) / 2 + lineHeight * 0.8;
  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, startY + i * lineHeight);
  });

  // Copper rule + author line.
  ctx.strokeStyle = p.rule;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 40, 900);
  ctx.lineTo(W / 2 + 40, 900);
  ctx.stroke();
  const attribution = input.source ? `— ${input.authorName} · ${input.source}` : `— ${input.authorName}`;
  ctx.fillStyle = p.muted;
  ctx.font = "500 30px 'Playfair Display', Georgia, serif";
  ctx.fillText(attribution, W / 2, 950);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("image-generation-failed");
  return blob;
}

function fileName(quoteId: string): string {
  return `${BRAND_SLUG}-quote-${quoteId}.png`;
}

// ---------------------------------------------------------------------------
// ShareQuoteButton — one Share button per quote. Renders the quote image on
// canvas, opens the native share sheet with the PNG where supported,
// otherwise shows a fallback panel (Download + Copy link + platform links).
// Works for guests — no sign-in required.
// ---------------------------------------------------------------------------

export default function ShareQuoteButton({
  quoteId,
  text,
  authorName,
  source,
}: {
  quoteId: string;
  text: string;
  authorName: string;
  source: string;
}) {
  const [status, setStatus] = useState<"idle" | "generating" | "error">("idle");
  const [panelOpen, setPanelOpen] = useState(false);
  const [variant, setVariant] = useState<Variant>("light");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const urlRef = useRef<string | null>(null);

  const quoteUrl = typeof window !== "undefined" ? `${window.location.origin}/quotes/${quoteId}` : `/quotes/${quoteId}`;
  const shareText = `"${text}" — ${authorName}`;
  const shareTextWithUrl = `${shareText} ${quoteUrl}`;

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setObjectUrl(null);
  }, []);

  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen, closePanel]);

  async function renderFor(v: Variant): Promise<Blob> {
    const next = await drawQuoteImage({ text, authorName, source }, v);
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(next);
    urlRef.current = url;
    setBlob(next);
    setObjectUrl(url);
    return next;
  }

  async function handleShare() {
    if (panelOpen) {
      closePanel();
      return;
    }
    setStatus("generating");
    setCopyFailed(false);
    try {
      const next = await renderFor(variant);
      const file = new File([next], fileName(quoteId), { type: "image/png" });
      if (typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({
          files: [file],
          title: "Quote Place quote",
          text: `${shareText} · ${source} · ${quoteUrl}`,
        });
        // Fire-and-forget share analytics — never blocks or fails the share.
        try {
          await incrementQuoteCounter(quoteId, "shareCount");
        } catch { /* ignore */ }
        setStatus("idle");
        return;
      }
      setStatus("idle");
      setPanelOpen(true);
    } catch {
      setStatus("error");
      setBlob(null);
      setPanelOpen(true);
    }
  }

  async function handleVariant(v: Variant) {
    setVariant(v);
    try {
      await renderFor(v);
    } catch {
      setStatus("error");
      setBlob(null);
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(quoteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopyFailed(true);
    }
  }

  const encText = encodeURIComponent(shareText);
  const encTextUrl = encodeURIComponent(shareTextWithUrl);
  const encUrl = encodeURIComponent(quoteUrl);

  return (
    <div>
      <button
        type="button"
        onClick={handleShare}
        disabled={status === "generating"}
        aria-busy={status === "generating"}
        className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-sm"
      >
        {status === "generating" ? "Preparing image…" : "Share"}
      </button>
      {status === "error" && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          Couldn&apos;t make the image. Try downloading it instead.
        </p>
      )}
      {panelOpen && (
        <div className="mt-3 rounded-xl border border-[var(--border)] bg-white p-4">
          {blob && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Background:</span>
              {(["light", "dark", "parchment"] as Variant[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleVariant(v)}
                  aria-pressed={variant === v}
                  className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm capitalize"
                >
                  {v}
                </button>
              ))}
            </div>
          )}
          {objectUrl && (
            <a
              href={objectUrl}
              download={fileName(quoteId)}
              className="mt-3 inline-block rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white"
            >
              Download image
            </a>
          )}
          <div className="mt-3">
            {copyFailed ? (
              <input
                readOnly
                value={quoteUrl}
                aria-label="Quote link"
                className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
                onFocus={(e) => e.target.select()}
              />
            ) : (
              <button
                type="button"
                onClick={handleCopyLink}
                className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-sm"
              >
                {copied ? "Copied!" : "Copy link"}
              </button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Share this quote">
            <a href={`https://twitter.com/intent/tweet?text=${encText}&url=${encUrl}`} target="_blank" rel="noreferrer" className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-sm">
              X / Twitter
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encUrl}`} target="_blank" rel="noreferrer" className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-sm">
              Facebook
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`} target="_blank" rel="noreferrer" className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-sm">
              LinkedIn
            </a>
            <a href={`https://wa.me/?text=${encTextUrl}`} target="_blank" rel="noreferrer" className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-sm">
              WhatsApp
            </a>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Facebook and LinkedIn links share the page URL only — they can&apos;t attach the image. Use Download image and upload the PNG to your post.
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SaveQuoteButton — Save / Saved toggle via the existing favorites helpers
// (Firestore when signed in, localStorage for guests). Guests get a one-time
// per-session nudge; the save itself is never blocked.
// ---------------------------------------------------------------------------

export function SaveQuoteButton({ quoteId }: { quoteId: string }) {
  const { user } = useAuth();
  const [fav, setFav] = useState(false);
  const [showNudge, setShowNudge] = useState(false);

  useEffect(() => {
    setFav(isFavourite(quoteId));
  }, [quoteId]);

  async function handleSave() {
    const next = await toggleFavourite(quoteId);
    setFav(next);
    if (next && !user && typeof window !== "undefined" && !sessionStorage.getItem("qp-save-nudge-shown")) {
      sessionStorage.setItem("qp-save-nudge-shown", "1");
      setShowNudge(true);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSave}
        aria-pressed={fav}
        className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-sm"
      >
        {fav ? "★ Saved" : "☆ Save"}
      </button>
      {showNudge && (
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Saved in this browser. <Link href="/login" className="underline">Sign in</Link> to keep your saved quotes on every device.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ReportQuoteForm — correction reporting via createSubmission (moderation).
// Same behaviour as the previous Report form; sign-in required.
// ---------------------------------------------------------------------------

export function ReportQuoteForm({ quoteId, text }: { quoteId: string; text: string }) {
  const { user } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDone, setReportDone] = useState(false);
  const [reportError, setReportError] = useState("");

  async function submitReport(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setReportError("Sign in to report a quote.");
      return;
    }
    if (!reportReason.trim()) {
      setReportError("Please say what is wrong.");
      return;
    }
    try {
      await createSubmission(user.uid, user.displayName || "Reader", "correction", {
        quoteId,
        reason: reportReason.trim(),
        text,
      });
      setReportDone(true);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "Could not send the report.");
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setReportOpen((v) => !v)}
        className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-sm"
      >
        Report
      </button>
      {reportOpen && (
        <form onSubmit={submitReport} className="mt-4 rounded-xl border border-[var(--border)] bg-white p-4">
          {reportDone ? (
            <p role="status" className="text-sm">
              Thanks — your report was sent for review.
            </p>
          ) : (
            <>
              <label htmlFor="report-reason" className="block text-sm font-medium">
                What is wrong with this quote?
              </label>
              <textarea
                id="report-reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                rows={2}
                placeholder="e.g. wrong author, wrong wording, not public domain…"
                className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
              />
              {reportError && (
                <p role="alert" className="mt-2 text-sm text-red-700">
                  {reportError}
                </p>
              )}
              {!user && <p className="mt-2 text-sm text-[var(--muted-foreground)]">Reporting requires sign-in.</p>}
              <button type="submit" className="mt-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white">
                Send report
              </button>
            </>
          )}
        </form>
      )}
    </div>
  );
}
