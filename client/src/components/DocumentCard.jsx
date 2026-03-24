import React from "react";

/* ─── Document Icon ───────────────────────────────────────────────────── */
const DocIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2a5cff"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ─── DocumentCard ────────────────────────────────────────────────────── */
export default function DocumentCard({ document, viewMode, onClick }) {
  const isGrid = viewMode === "grid";

  return (
    <div
      onClick={() => onClick(document._id)}
      className={`bg-white border border-[rgba(0,0,0,0.07)] rounded-[14px] cursor-pointer relative transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_10px_32px_rgba(0,0,0,0.09)] hover:border-[rgba(0,0,0,0.12)] sw-fade-up ${
        isGrid
          ? "p-[22px_20px_18px]"
          : "flex items-center gap-4 py-[14px] px-[18px]"
      }`}
    >
      {/* Icon */}
      <div
        className={`flex items-start justify-between ${
          isGrid ? "mb-4" : "mb-0 shrink-0"
        }`}
      >
        <div className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center shrink-0 bg-[#eef1ff]">
          <DocIcon />
        </div>
      </div>

      {/* Content */}
      <div className={isGrid ? "" : "flex-1 min-w-0"}>
        <div
          className={`font-bold tracking-[-0.02em] leading-[1.25] text-[#111110] truncate ${
            isGrid ? "text-[16px] mb-2" : "text-[14px] mb-[2px]"
          }`}
        >
          {document.title || "Untitled Document"}
        </div>
        <div className="text-[11px] text-[#b0afa8] font-normal">
          {formatDate(document.updatedAt)}
        </div>
      </div>
    </div>
  );
}
