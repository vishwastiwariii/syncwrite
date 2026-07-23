import React, { useEffect, useRef } from "react";
import { EditorContent } from "@tiptap/react";
import { formatDate } from "../../utils/document";

/* The writing surface: title, meta line, and the Tiptap editor.

   The body is a rich-text ProseMirror editor bound to Yjs (created by the
   parent EditorSurface). Concurrent remote edits merge into it and remote
   carets render inline — the plain <textarea> this replaced could do neither.
   Word count is computed by the parent from the editor's plaintext. */
export default function EditorCanvas({
  editor,
  title,
  words = 0,
  updatedAt,
  users = [],
  onTitleChange,
}) {
  const titleRef = useRef(null);

  /* Title is a textarea, not an input, so long titles wrap instead of being
     clipped. Re-measure whenever the text changes so it grows with content. */
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [title]);

  return (
    <div className="mx-auto w-full max-w-[640px] px-6 pt-14 pb-4 sm:px-8">
      {/* Meta */}
      <div className="mb-2.5 text-[13px] text-sw-faint">
        Updated {formatDate(updatedAt) || "just now"} · {words.toLocaleString()}{" "}
        {words === 1 ? "word" : "words"}
        {users.length > 0 && ` · ${users.length} editing now`}
      </div>

      {/* Title */}
      <textarea
        ref={titleRef}
        rows={1}
        value={title}
        onChange={onTitleChange}
        onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
        placeholder="Untitled Document"
        aria-label="Document title"
        className="w-full resize-none overflow-hidden border-none bg-transparent font-serif text-[clamp(32px,5vw,46px)] font-medium leading-[1.05] tracking-[-0.02em] text-sw-ink outline-none placeholder:text-sw-faint"
      />

      <div className="my-[26px] h-px bg-sw-line" />

      {/* Body — the Tiptap/ProseMirror editor. The Collaboration extension owns
          its content and caret via Yjs; React never resets it. */}
      <EditorContent editor={editor} />
    </div>
  );
}
