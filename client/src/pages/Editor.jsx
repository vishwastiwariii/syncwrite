import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { documentService } from "../services/document.service";
import { useSocket } from "../hooks/useSocket";
import { useDebounceCallback } from "../hooks/useDebounce";
import Sidebar from "../components/Sidebar";
import ShareModal from "../components/ShareModal";
import DocumentEditor from "../components/editor/DocumentEditor";

/* ═══════════════════════════════════════════════════════════════════════
   Editor page — owns data, sockets, and the optimistic version guard.
   All presentation lives in <DocumentEditor />.
   ═══════════════════════════════════════════════════════════════════════ */
export default function Editor() {
  const { id: documentId } = useParams();
  const navigate = useNavigate();

  /* ── Document state ── */
  const [doc, setDoc] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeNav, setActiveNav] = useState("All Documents");
  const [showShareModal, setShowShareModal] = useState(false);

  /* ── Presence & conflict ── */
  const [activeUsers, setActiveUsers] = useState([]);
  const [conflict, setConflict] = useState(false);

  /* ── Refs for avoiding infinite loops ── */
  const isRemoteUpdate = useRef(false);
  const textareaRef = useRef(null);

  /* ── Version the client is currently editing on top of (baseVersion). ──
     Updated from the server on ACK, remote broadcasts, and conflicts so every
     outgoing edit is guarded against the version we actually last saw. */
  const versionRef = useRef(0);

  /* ── Socket & Debounce hooks ── */
  const { emit, on } = useSocket(documentId);

  const debouncedUpdate = useDebounceCallback((newContent) => {
    emit("DOCUMENT_UPDATE", { documentId, content: newContent, baseVersion: versionRef.current });
    setSaving(false);
  }, 400);

  const debouncedTitleUpdate = useDebounceCallback(async (newTitle) => {
    try {
      await documentService.updateDocument(documentId, { title: newTitle });
    } catch (err) {
      console.error("Failed to save title:", err);
    }
  }, 600);

  /* ── Fetch initial document ── */
  const fetchDocument = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await documentService.getDocumentById(documentId);
      const d = res.data;
      setDoc(d);
      setTitle(d.title || "Untitled Document");
      setContent(d.content || "");
      versionRef.current = d.version ?? 0;
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load document");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  /* ── Socket handlers ── */
  useEffect(() => {
    if (!documentId) return;

    const cleanupHandlers = [
      on("DOCUMENT_UPDATED", ({ content: newContent, version }) => {
        isRemoteUpdate.current = true;
        setContent(newContent);
        if (typeof version === "number") versionRef.current = version;
      }),
      // Our own write landed — advance to the version the server assigned.
      on("VERSION_ACK", ({ version }) => {
        if (typeof version === "number") versionRef.current = version;
      }),
      // Someone else wrote on top of our base version. Adopt the server's
      // state so we don't silently clobber their edit, and re-guard on the
      // new version. (Whole-document merge isn't possible here — that's the
      // Yjs migration. Until then the loser's un-acked keystrokes are lost,
      // but no committed data is.)
      on("VERSION_CONFLICT", ({ currentVersion, content: serverContent }) => {
        isRemoteUpdate.current = true;
        if (typeof serverContent === "string") setContent(serverContent);
        if (typeof currentVersion === "number") versionRef.current = currentVersion;
        setConflict(true);
      }),
      on("PRESENCE_UPDATE", ({ users }) => {
        setActiveUsers(users || []);
      }),
      on("ERROR", ({ message }) => {
        console.error("[Socket Error]", message);
      }),
    ];

    return () => cleanupHandlers.forEach((cleanup) => cleanup && cleanup());
  }, [documentId, on]);

  /* ── Content change handler (local edits only) ── */
  const handleContentChange = useCallback(
    (e) => {
      if (isRemoteUpdate.current) {
        isRemoteUpdate.current = false;
        return;
      }

      const newContent = e.target.value;
      setContent(newContent);
      setSaving(true);
      debouncedUpdate(newContent);
    },
    [debouncedUpdate]
  );

  /* ── Title change handler ── */
  const handleTitleChange = useCallback(
    (e) => {
      const newTitle = e.target.value;
      setTitle(newTitle);
      debouncedTitleUpdate(newTitle);
    },
    [debouncedTitleUpdate]
  );

  /* ── Formatting toolbar actions ── */
  const wrapSelection = useCallback(
    (before, after) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = ta.value.substring(start, end);
      const replacement = before + selected + after;
      const newContent = ta.value.substring(0, start) + replacement + ta.value.substring(end);

      setContent(newContent);
      setSaving(true);
      debouncedUpdate(newContent);

      requestAnimationFrame(() => {
        ta.focus();
        ta.selectionStart = start + before.length;
        ta.selectionEnd = start + before.length + selected.length;
      });
    },
    [debouncedUpdate]
  );

  return (
    <div className="min-h-screen bg-sw-bg text-sw-ink">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      <div className="ml-[240px] flex min-h-screen">
        <DocumentEditor
          title={title}
          content={content}
          updatedAt={doc?.updatedAt}
          loading={loading}
          error={error}
          saving={saving}
          conflict={conflict}
          users={activeUsers}
          onTitleChange={handleTitleChange}
          onContentChange={handleContentChange}
          onFormat={wrapSelection}
          onBack={() => navigate("/dashboard")}
          onShare={() => setShowShareModal(true)}
          onRetry={fetchDocument}
          onDismissConflict={() => setConflict(false)}
          textareaRef={textareaRef}
        />
      </div>

      {showShareModal && (
        <ShareModal documentId={documentId} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}
