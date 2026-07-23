import React from "react";
import EditorTopBar from "./EditorTopBar";
import EditorSurface from "./EditorSurface";
import CommentsRail from "./CommentsRail";
import { EditorSkeleton, EditorError } from "./EditorStates";

/* ─── DocumentEditor ──────────────────────────────────────────────────────
   The whole editor surface (screen 08), composed from its parts. Holds no
   data logic of its own — the page owns fetching, the collaborative Y.Doc, and
   metadata saves, and passes everything down.

   The body is a Yjs CRDT, so there is no version guard and no conflict state:
   concurrent edits merge. EditorSurface mounts only once `doc`/`awareness` are
   ready, so the Tiptap editor binds to a live doc from its first render.     */
export default function DocumentEditor({
  /* content */
  title,
  updatedAt,
  /* collaboration */
  doc,
  awareness,
  user,
  /* status */
  loading,
  error,
  saving,
  users = [],
  /* handlers */
  onTitleChange,
  onBack,
  onShare,
  onRetry,
}) {
  const ready = !loading && !error && doc && awareness;

  return (
    <section className="flex min-h-screen flex-1 flex-col bg-sw-surface">
      <EditorTopBar
        title={title}
        saving={saving}
        users={users}
        onBack={onBack}
        onShare={onShare}
      />

      {loading || (!ready && !error) ? (
        <EditorSkeleton />
      ) : error ? (
        <EditorError message={error} onRetry={onRetry} />
      ) : (
        <div className="flex flex-1">
          <EditorSurface
            doc={doc}
            awareness={awareness}
            user={user}
            title={title}
            updatedAt={updatedAt}
            users={users}
            onTitleChange={onTitleChange}
          />
          <CommentsRail />
        </div>
      )}
    </section>
  );
}
