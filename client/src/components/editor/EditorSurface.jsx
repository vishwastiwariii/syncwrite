import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import Placeholder from "@tiptap/extension-placeholder";
import EditorCanvas from "./EditorCanvas";
import FormatToolbar from "./FormatToolbar";
import { colorFromId, CONTENT_FRAGMENT_NAME } from "../../services/ydoc";

/* ─── EditorSurface ───────────────────────────────────────────────────────
   Owns the Tiptap editor instance and the writing column (canvas + toolbar).

   Mounted only once the collaborative Y.Doc + Awareness exist, so the
   Collaboration / CollaborationCaret extensions bind to a live doc from the
   first render — no null-doc guard, no re-init churn.

   - Collaboration binds the ProseMirror doc to the "default" Y.XmlFragment
     inside `doc`. StarterKit's own undo/redo is disabled because Yjs owns
     history (per-user undo that's correct under concurrency).
   - CollaborationCaret renders remote users' carets + name labels, driven by
     the shared Awareness. We hand it a minimal provider ({ awareness }) since
     awareness is relayed over Socket.IO, not a y-websocket provider.        */
export default function EditorSurface({
  doc,
  awareness,
  user,
  title,
  updatedAt,
  users = [],
  onTitleChange,
}) {
  const [words, setWords] = useState(0);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({ undoRedo: false }),
        Placeholder.configure({ placeholder: "Start writing…" }),
        Collaboration.configure({ document: doc, field: CONTENT_FRAGMENT_NAME }),
        CollaborationCaret.configure({
          provider: { awareness },
          user: {
            id: user?.id,
            name: user?.name || "Anonymous",
            color: colorFromId(user?.id || ""),
          },
        }),
      ],
      editorProps: {
        attributes: {
          class: "sw-prose",
          "aria-label": "Document content",
        },
      },
    },
    [doc, awareness]
  );

  /* Word count mirrors the editor's plaintext. Recomputed on every edit
     (local or remote) — the editor is the single source of truth for the
     body, so we read it rather than tracking a separate string. */
  useEffect(() => {
    if (!editor) return;
    const update = () => setWords(wordsIn(editor.getText()));
    update();
    editor.on("update", update);
    return () => {
      editor.off("update", update);
    };
  }, [editor]);

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <EditorCanvas
        editor={editor}
        title={title}
        words={words}
        updatedAt={updatedAt}
        users={users}
        onTitleChange={onTitleChange}
      />
      <FormatToolbar editor={editor} />
    </div>
  );
}

/* Word count off the editor's plaintext (blocks are newline-separated). */
function wordsIn(text) {
  const trimmed = String(text || "").trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}
