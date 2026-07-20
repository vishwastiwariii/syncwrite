import React from "react";

/* Comment threads have no backend yet, so this rail renders an honest
   empty state rather than mock threads. When a comments API lands, drop
   the real threads in place of <EmptyState/>. */
export default function CommentsRail() {
  return (
    <aside className="hidden w-[300px] shrink-0 flex-col border-l border-sw-line bg-[#fcfcfe] px-[18px] py-[22px] xl:flex">
      <div className="flex items-center justify-between">
        <div className="text-[14px] font-semibold">Comments</div>
        <span className="rounded-full bg-sw-violet-2 px-[9px] py-[3px] text-[12px] text-sw-faint">
          Coming soon
        </span>
      </div>

      <div className="mt-6 flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-sw-violet-soft text-sw-violet">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <p className="text-[13px] font-semibold text-sw-ink">No comments yet</p>
        <p className="mt-1.5 text-[12.5px] leading-[1.55] text-sw-muted">
          Inline threads and @mentions are on the way. For now, collaborate
          live — every edit syncs in real time.
        </p>
      </div>

      <div className="mt-auto cursor-not-allowed rounded-xl border border-sw-line bg-sw-surface px-3 py-2.5 text-[13px] text-sw-faint">
        Add a comment…
      </div>
    </aside>
  );
}
