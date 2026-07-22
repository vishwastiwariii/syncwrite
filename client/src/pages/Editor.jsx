import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { documentService } from "../services/document.service";
import { useAuth } from "../hooks/useAuth";
import { useCollaborativeDocument } from "../hooks/useCollaborativeDocument";
import { useDebounceCallback } from "../hooks/useDebounce";
import { bindTextareaToYText } from "../services/ydoc";
import Sidebar from "../components/Sidebar";
import ShareModal from "../components/ShareModal";
import DocumentEditor from "../components/editor/DocumentEditor";

/* ═══════════════════════════════════════════════════════════════════════
   Editor page — owns metadata (title), sockets, and the CRDT binding.

   The document body is a Yjs shared type: concurrent edits merge, so there is
   no version guard, no conflict banner, and no debounced whole-document push.
   The title is still plain metadata saved over REST.
   ═══════════════════════════════════════════════════════════════════════ */
export default function Editor() {
  const { id: documentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  /* ── Document metadata (title/updatedAt come from REST; body from Yjs) ── */
  const [doc, setDoc] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeNav, setActiveNav] = useState("All Documents");
  const [showShareModal, setShowShareModal] = useState(false);

  /* ── Word-count mirror of the body. Not the textarea's value — the binding
        owns that. This is display-only, updated when the shared text changes. ── */
  const [bodyText, setBodyText] = useState("");

  const textareaRef = useRef(null);
  const bindingRef = useRef(null);

  /* ── Live collaboration: the shared body + deduped presence list. ── */
  const { ytext, users, status } = useCollaborativeDocument(documentId, user);

  const debouncedTitleUpdate = useDebounceCallback(async (newTitle) => {
    try {
      await documentService.updateDocument(documentId, { title: newTitle });
    } catch (err) {
      console.error("Failed to save title:", err);
    }
  }, 600);

  /* ── Fetch title/metadata and confirm access. The body is NOT taken from
        here — it arrives via the Yjs sync handshake. ── */
  const fetchDocument = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await documentService.getDocumentById(documentId);
      const d = res.data;
      setDoc(d);
      setTitle(d.title || "Untitled Document");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load document");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  /* ── Bind the textarea to the shared type once both exist. The binding does
        the two-way sync and caret preservation; we also mirror the text into
        state for the word counter. ── */
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!ytext || !textarea) return;

    const binding = bindTextareaToYText(textarea, ytext);
    bindingRef.current = binding;

    const syncBodyText = () => setBodyText(ytext.toString());
    syncBodyText();
    ytext.observe(syncBodyText);

    return () => {
      ytext.unobserve(syncBodyText);
      binding.destroy();
      bindingRef.current = null;
    };
  }, [ytext, loading]);

  /* ── Title change (metadata, REST). ── */
  const handleTitleChange = useCallback(
    (e) => {
      const newTitle = e.target.value;
      setTitle(newTitle);
      debouncedTitleUpdate(newTitle);
    },
    [debouncedTitleUpdate]
  );

  /* ── Formatting toolbar — edits the shared type via the binding. ── */
  const handleFormat = useCallback((before, after) => {
    bindingRef.current?.wrapSelection(before, after);
  }, []);

  return (
    <div className="min-h-screen bg-sw-bg text-sw-ink">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      <div className="ml-[240px] flex min-h-screen">
        <DocumentEditor
          title={title}
          content={bodyText}
          updatedAt={doc?.updatedAt}
          loading={loading}
          error={error}
          saving={status !== "synced"}
          conflict={false}
          users={users}
          onTitleChange={handleTitleChange}
          onContentChange={undefined}
          onFormat={handleFormat}
          onBack={() => navigate("/dashboard")}
          onShare={() => setShowShareModal(true)}
          onRetry={fetchDocument}
          onDismissConflict={() => {}}
          textareaRef={textareaRef}
        />
      </div>

      {showShareModal && (
        <ShareModal documentId={documentId} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}
