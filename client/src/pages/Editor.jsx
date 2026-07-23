import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { documentService } from "../services/document.service";
import { createSocket } from "../services/socket";
import { useAuth } from "../hooks/useAuth";
import { useCollaborativeDocument } from "../hooks/useCollaborativeDocument";
import { useDebounceCallback } from "../hooks/useDebounce";
import Sidebar from "../components/Sidebar";
import ShareModal from "../components/ShareModal";
import DocumentEditor from "../components/editor/DocumentEditor";

/* ═══════════════════════════════════════════════════════════════════════
   Editor page — owns metadata (title) and the collaborative Y.Doc.

   The document body is a Yjs shared type edited through Tiptap: concurrent
   edits merge, so there is no version guard, no conflict banner, and no
   debounced whole-document push. The title is still plain metadata saved over
   REST. The editor UI (Tiptap instance, toolbar, word count) lives under
   DocumentEditor → EditorSurface; this page only wires data in.
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

  /* ── Live collaboration: the shared Y.Doc + Awareness and deduped presence. ── */
  const { doc: ydoc, awareness, users, status } = useCollaborativeDocument(documentId, user);

  /* The last title we pushed. The server broadcasts renames to the whole room,
     including us — re-applying our own echo would overwrite whatever the user
     has typed in the 600ms since the debounce fired. */
  const lastSentTitleRef = useRef(null);

  const debouncedTitleUpdate = useDebounceCallback(async (newTitle) => {
    try {
      lastSentTitleRef.current = newTitle;
      await documentService.updateDocument(documentId, { title: newTitle });
    } catch (err) {
      console.error("Failed to save title:", err);
    }
  }, 600);

  /* ── Live title. The body is a CRDT and syncs itself; the title is metadata
        on a REST path, so the server broadcasts it to the room and we apply it
        here. Without this, a collaborator's rename only appears on reload.

        Last-write-wins by design: if two people rename at once, the later save
        stands (see the socket handler in document.service.js). ── */
  useEffect(() => {
    if (!documentId) return;

    const socket = createSocket();

    const onMetadata = ({ documentId: id, title: nextTitle }) => {
      if (id !== documentId) return;
      if (nextTitle === lastSentTitleRef.current) return; // our own echo
      setTitle(nextTitle);
    };

    socket.on("DOCUMENT_METADATA", onMetadata);
    return () => socket.off("DOCUMENT_METADATA", onMetadata);
  }, [documentId]);

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

  /* ── Title change (metadata, REST). ── */
  const handleTitleChange = useCallback(
    (e) => {
      const newTitle = e.target.value;
      setTitle(newTitle);
      debouncedTitleUpdate(newTitle);
    },
    [debouncedTitleUpdate]
  );

  return (
    <div className="min-h-screen bg-sw-bg text-sw-ink">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      <div className="ml-[240px] flex min-h-screen">
        <DocumentEditor
          title={title}
          updatedAt={doc?.updatedAt}
          doc={ydoc}
          awareness={awareness}
          user={user}
          loading={loading}
          error={error}
          saving={status !== "synced"}
          users={users}
          onTitleChange={handleTitleChange}
          onBack={() => navigate("/dashboard")}
          onShare={() => setShowShareModal(true)}
          onRetry={fetchDocument}
        />
      </div>

      {showShareModal && (
        <ShareModal documentId={documentId} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}
