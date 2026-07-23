import React from "react";
import { useEditorState } from "@tiptap/react";

const Divider = () => <span className="mx-1 h-5 w-px bg-sw-line" />;

const Sparkle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.94 14.06A2 2 0 0 0 8.5 12.62l-5.14-1.32a.42.42 0 0 1 0-.8L8.5 9.18a2 2 0 0 0 1.44-1.44l1.32-5.14a.42.42 0 0 1 .8 0l1.32 5.14a2 2 0 0 0 1.44 1.44l5.14 1.32a.42.42 0 0 1 0 .8l-5.14 1.32a2 2 0 0 0-1.44 1.44l-1.32 5.14a.42.42 0 0 1-.8 0z" />
    <path d="M20 3v4M22 5h-4" />
  </svg>
);

const Btn = ({ label, onClick, active = false, disabled = false, children }) => (
  <button
    title={label}
    aria-label={label}
    aria-pressed={active}
    onClick={onClick}
    disabled={disabled}
    // Keep the editor selection intact — without this, mousedown can collapse
    // it before the command reads the current selection.
    onMouseDown={(e) => e.preventDefault()}
    className={`grid h-8 min-w-8 place-items-center rounded-[9px] px-2 transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
      active ? "bg-sw-violet-soft text-sw-violet" : "text-sw-ink hover:bg-sw-violet-2"
    }`}
  >
    {children}
  </button>
);

/* Floating format bar. Actions are real Tiptap commands that apply semantic
   marks/nodes to the shared ProseMirror doc (so peers see rich formatting,
   not markdown markers). Button state reflects the current selection. */
export default function FormatToolbar({ editor }) {
  // Subscribe to the editor so active states re-render on selection change.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e?.isActive("bold") ?? false,
      italic: e?.isActive("italic") ?? false,
      underline: e?.isActive("underline") ?? false,
      strike: e?.isActive("strike") ?? false,
      heading: e?.isActive("heading", { level: 2 }) ?? false,
      bullet: e?.isActive("bulletList") ?? false,
      quote: e?.isActive("blockquote") ?? false,
      link: e?.isActive("link") ?? false,
    }),
  });

  const disabled = !editor;
  const chain = () => editor.chain().focus();

  const toggleLink = () => {
    if (state.link) {
      chain().unsetLink().run();
      return;
    }
    const url = window.prompt("Link URL");
    if (url) chain().setLink({ href: url }).run();
  };

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

        <Btn label="Bold" disabled={disabled} active={state.bold} onClick={() => chain().toggleBold().run()}>
          <span className="text-[15px] font-bold">B</span>
        </Btn>
        <Btn label="Italic" disabled={disabled} active={state.italic} onClick={() => chain().toggleItalic().run()}>
          <span className="font-serif text-[15px] italic">I</span>
        </Btn>
        <Btn label="Underline" disabled={disabled} active={state.underline} onClick={() => chain().toggleUnderline().run()}>
          <span className="text-[15px] underline">U</span>
        </Btn>
        <Btn label="Strikethrough" disabled={disabled} active={state.strike} onClick={() => chain().toggleStrike().run()}>
          <span className="text-[15px] line-through">S</span>
        </Btn>

        <Divider />

        <Btn label="Heading" disabled={disabled} active={state.heading} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
          <span className="text-[13.5px] font-semibold">H2</span>
        </Btn>
        <Btn label="Bullet list" disabled={disabled} active={state.bullet} onClick={() => chain().toggleBulletList().run()}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </Btn>
        <Btn label="Quote" disabled={disabled} active={state.quote} onClick={() => chain().toggleBlockquote().run()}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z" />
          </svg>
        </Btn>
        <Btn label="Link" disabled={disabled} active={state.link} onClick={toggleLink}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </Btn>
      </div>
    </div>
  );
}
