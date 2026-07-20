import React from "react";
import EditorTopBar from "./EditorTopBar";
import EditorCanvas from "./EditorCanvas";
import FormatToolbar from "./FormatToolbar";
import CommentsRail from "./CommentsRail";
import { EditorSkeleton, EditorError, ConflictBanner } from "./EditorStates";

/* ─── DocumentEditor ──────────────────────────────────────────────────────
   The whole editor surface (screen 08), composed from its parts. Holds no
   data logic of its own — the page owns fetching, sockets, and the version
   guard, and passes everything down. Mount it and hand it props.           */
export default function DocumentEditor({
  /* content */
  title,
  content,
  updatedAt,
  /* status */
  loading,
  error,
  saving,
  conflict,
  users = [],
  /* handlers */
  onTitleChange,
  onContentChange,
  onFormat,
  onBack,
  onShare,
  onRetry,
  onDismissConflict,
  textareaRef,
}) {
  return (
    <section className="flex min-h-screen flex-1 flex-col bg-sw-surface">
      <EditorTopBar
        title={title}
        saving={saving}
        users={users}
        onBack={onBack}
        onShare={onShare}
      />

      {loading ? (
        <EditorSkeleton />
      ) : error ? (
        <EditorError message={error} onRetry={onRetry} />
      ) : (
        <div className="flex flex-1">
          {/* Writing surface */}
          <div className="flex min-w-0 flex-1 flex-col">
            {conflict && <ConflictBanner onDismiss={onDismissConflict} />}
            <EditorCanvas
              title={title}
              content={content}
              updatedAt={updatedAt}
              users={users}
              onTitleChange={onTitleChange}
              onContentChange={onContentChange}
              textareaRef={textareaRef}
            />
            <FormatToolbar onFormat={onFormat} />
          </div>

          <CommentsRail />
        </div>
      )}
    </section>
  );
}
