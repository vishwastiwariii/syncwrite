import React from "react";

const Divider = () => <span className="mx-1 h-5 w-px bg-sw-line" />;

const Sparkle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.94 14.06A2 2 0 0 0 8.5 12.62l-5.14-1.32a.42.42 0 0 1 0-.8L8.5 9.18a2 2 0 0 0 1.44-1.44l1.32-5.14a.42.42 0 0 1 .8 0l1.32 5.14a2 2 0 0 0 1.44 1.44l5.14 1.32a.42.42 0 0 1 0 .8l-5.14 1.32a2 2 0 0 0-1.44 1.44l-1.32 5.14a.42.42 0 0 1-.8 0z" />
    <path d="M20 3v4M22 5h-4" />
  </svg>
);

const Btn = ({ label, onClick, children, className = "" }) => (
  <button
    title={label}
    aria-label={label}
    onClick={onClick}
    // Keep the textarea's selection intact — without this, mousedown can
    // collapse it before the handler reads selectionStart/End.
    onMouseDown={(e) => e.preventDefault()}
    className={`grid h-8 min-w-8 place-items-center rounded-[9px] px-2 text-sw-ink transition-colors duration-150 hover:bg-sw-violet-2 ${className}`}
  >
    {children}
  </button>
);

/* Floating format bar. Actions map to the page's markdown wrapSelection. */
export default function FormatToolbar({ onFormat }) {
  return (
    <div className="pointer-events-none sticky bottom-6 z-10 flex justify-center px-4">
      <div className="pointer-events-auto inline-flex items-center gap-0.5 rounded-[14px] border border-sw-line bg-sw-surface p-1.5 shadow-[0_20px_44px_-18px_rgba(20,18,30,0.4)]">
        <button
          disabled
          title="AI assistance is coming soon"
          className="flex cursor-not-allowed items-center gap-1.5 rounded-[9px] bg-sw-violet-soft px-3 py-[7px] text-[14px] font-semibold text-sw-violet opacity-70"
        >
          <Sparkle /> Ask AI
        </button>

        <Divider />

        <Btn label="Bold" onClick={() => onFormat("**", "**")}>
          <span className="text-[15px] font-bold">B</span>
        </Btn>
        <Btn label="Italic" onClick={() => onFormat("*", "*")}>
          <span className="font-serif text-[15px] italic">I</span>
        </Btn>
        <Btn label="Underline" onClick={() => onFormat("<u>", "</u>")}>
          <span className="text-[15px] underline">U</span>
        </Btn>
        <Btn label="Strikethrough" onClick={() => onFormat("~~", "~~")}>
          <span className="text-[15px] text-sw-muted line-through">S</span>
        </Btn>

        <Divider />

        <Btn label="Heading" onClick={() => onFormat("## ", "")}>
          <span className="text-[13.5px] font-semibold">H2</span>
        </Btn>
        <Btn label="Bullet list" onClick={() => onFormat("- ", "")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </Btn>
        <Btn label="Quote" onClick={() => onFormat("> ", "")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z" />
          </svg>
        </Btn>
        <Btn label="Link" onClick={() => onFormat("[", "](url)")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </Btn>
      </div>
    </div>
  );
}
