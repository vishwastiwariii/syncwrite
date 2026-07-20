import React from "react";

export function EditorSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[640px] animate-pulse px-8 pt-14">
      <div className="mb-4 h-3 w-40 rounded bg-sw-line-2" />
      <div className="h-11 w-3/5 rounded-lg bg-sw-line" />
      <div className="my-[26px] h-px bg-sw-line" />
      <div className="space-y-3.5">
        {["100%", "92%", "97%", "78%", "88%", "60%"].map((w, i) => (
          <div key={i} className="h-3.5 rounded bg-sw-line-2" style={{ width: w }} />
        ))}
      </div>
    </div>
  );
}

export function EditorError({ message, onRetry }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-24 text-center">
      <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#fdeaec] text-[#b42318]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="font-serif text-[22px] font-medium">Failed to load document</h3>
      <p className="mt-2 max-w-[360px] text-[14px] leading-[1.6] text-sw-muted">
        {message || "Something went wrong. Please try again."}
      </p>
      <button
        onClick={onRetry}
        className="mt-5 rounded-full bg-sw-ink px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-black"
      >
        Retry
      </button>
    </div>
  );
}

/* Shown when a remote write landed on top of our base version. */
export function ConflictBanner({ onDismiss }) {
  return (
    <div className="mx-6 mt-4 flex items-center gap-3 rounded-xl border border-[#f5c451] bg-[#fdf6e3] px-4 py-3">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b8860b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <span className="flex-1 text-[12.5px] font-medium text-[#7a5c00]">
        This document was updated by someone else. The latest version has been
        loaded — re-apply your changes if needed.
      </span>
      <button
        onClick={onDismiss}
        className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#b8860b] hover:text-[#7a5c00]"
      >
        Dismiss
      </button>
    </div>
  );
}
