import React from "react";
import { THUMBS, formatDate, wordCount } from "../utils/document";

/* ─── DocumentCard ────────────────────────────────────────────────────────
   `grid` renders the thumbnail card from the dashboard mock; `list` renders
   a compact row for dense browsing.                                        */
export default function DocumentCard({ document, viewMode = "grid", index = 0, onClick }) {
  const t = THUMBS[index % THUMBS.length];
  const words = wordCount(document.content);
  const meta = `Edited ${formatDate(document.updatedAt)}${words ? ` · ${words.toLocaleString()} words` : ""}`;

  if (viewMode === "list") {
    return (
      <button
        onClick={() => onClick(document._id)}
        className="flex w-full items-center gap-3.5 rounded-2xl border border-sw-line bg-sw-surface px-4 py-3 text-left transition-all duration-200 hover:border-[#ded9ef] hover:shadow-[0_10px_26px_-18px_rgba(20,18,30,0.5)]"
      >
        <span
          className="h-10 w-10 shrink-0 rounded-[10px] border border-sw-line"
          style={{ background: t.bg }}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold text-sw-ink">
            {document.title || "Untitled Document"}
          </span>
          <span className="block text-[12px] text-sw-faint">{meta}</span>
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={() => onClick(document._id)}
      className="group overflow-hidden rounded-2xl border border-sw-line bg-sw-surface text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(20,18,30,0.5)]"
    >
      <div className="h-24 p-3.5" style={{ background: t.bg }}>
        <div className="mb-[7px] h-[7px] w-[65%] rounded-[4px]" style={{ background: t.a }} />
        <div className="mb-[5px] h-[5px] w-[90%] rounded-[4px]" style={{ background: t.b }} />
        <div className="h-[5px] w-[72%] rounded-[4px]" style={{ background: t.b }} />
      </div>
      <div className="px-[15px] py-3">
        <div className="truncate text-[14px] font-semibold text-sw-ink">
          {document.title || "Untitled Document"}
        </div>
        <div className="mt-[3px] truncate text-[12px] text-sw-faint">{meta}</div>
      </div>
    </button>
  );
}
