import React from "react";
import PresenceStack from "./PresenceStack";

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const Sparkle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.94 14.06A2 2 0 0 0 8.5 12.62l-5.14-1.32a.42.42 0 0 1 0-.8L8.5 9.18a2 2 0 0 0 1.44-1.44l1.32-5.14a.42.42 0 0 1 .8 0l1.32 5.14a2 2 0 0 0 1.44 1.44l5.14 1.32a.42.42 0 0 1 0 .8l-5.14 1.32a2 2 0 0 0-1.44 1.44l-1.32 5.14a.42.42 0 0 1-.8 0z" />
    <path d="M20 3v4M22 5h-4" />
  </svg>
);

/* Breadcrumb, save state, presence, and document actions. */
export default function EditorTopBar({ title, saving, users, onBack, onShare }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-sw-line px-6 py-4">
      {/* Breadcrumb */}
      <div className="flex min-w-0 items-center gap-3 text-[14px]">
        <button
          onClick={onBack}
          aria-label="Back to documents"
          className="shrink-0 text-sw-ink transition-colors hover:text-sw-violet"
        >
          <BackIcon />
        </button>
        <span className="hidden text-sw-faint sm:inline">Documents</span>
        <span className="hidden text-sw-faint sm:inline">›</span>
        <span className="min-w-0 truncate font-semibold text-sw-ink">
          {title || "Untitled Document"}
        </span>

        {/* Save state — reflects the real debounced socket write */}
        {saving ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-sw-violet-soft px-[9px] py-[3px] text-[11px] font-semibold text-sw-violet">
            Saving…
          </span>
        ) : (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#E7F6EF] px-[9px] py-[3px] text-[11px] font-semibold text-[#28A56C]">
            <CheckIcon /> Saved
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <PresenceStack users={users} />

        <button
          disabled
          title="AI assistance is coming soon"
          className="flex cursor-not-allowed items-center gap-1.5 rounded-full bg-sw-violet-soft px-[15px] py-[9px] text-[13.5px] font-semibold text-sw-violet opacity-70"
        >
          <Sparkle /> Ask AI
        </button>

        <button
          onClick={onShare}
          className="rounded-full bg-sw-ink px-[17px] py-[9px] text-[13.5px] font-semibold text-white transition-colors duration-150 hover:bg-black"
        >
          Share
        </button>
      </div>
    </header>
  );
}
