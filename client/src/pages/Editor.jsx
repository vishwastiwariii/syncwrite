import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { documentService } from "../services/document.service";
import { useSocket } from "../hooks/useSocket";
import { useDebounceCallback } from "../hooks/useDebounce";
import Sidebar from "../components/Sidebar";
import ShareModal from "../components/ShareModal";

/* ─── Icons ───────────────────────────────────────────────────────────── */
const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const BoldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </svg>
);
const ItalicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
  </svg>
);
const UnderlineIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" /><line x1="4" y1="21" x2="20" y2="21" />
  </svg>
);
const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const QuoteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);
const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

/* ─── Presence avatar colors ──────────────────────────────────────────── */
const AVATAR_COLORS = [
  "#2a5cff", "#e64980", "#f76707", "#37b24d", "#ae3ec9", "#1098ad", "#f59f00",
];

function getAvatarColor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function getInitial(name) {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
}

/* ─── Relative time helper ────────────────────────────────────────────── */
function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(diff / 86400000);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ─── Skeleton Loader ─────────────────────────────────────────────────── */
function EditorSkeleton() {
  return (
    <div className="animate-pulse max-w-[720px] mx-auto py-16 px-8">
      <div className="h-[42px] bg-[#e8e8e4] rounded-lg w-3/5 mb-4" />
      <div className="h-[14px] bg-[#f0efeb] rounded w-1/4 mb-12" />
      <div className="space-y-4">
        <div className="h-[14px] bg-[#e8e8e4] rounded w-full" />
        <div className="h-[14px] bg-[#f0efeb] rounded w-[92%]" />
        <div className="h-[14px] bg-[#e8e8e4] rounded w-[85%]" />
        <div className="h-[14px] bg-[#f0efeb] rounded w-[78%]" />
        <div className="h-[14px] bg-[#e8e8e4] rounded w-full" />
        <div className="h-[14px] bg-[#f0efeb] rounded w-[60%]" />
      </div>
    </div>
  );
}

/* ─── Error State ─────────────────────────────────────────────────────── */
function EditorError({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 ed-fade-up">
      <div className="w-[72px] h-[72px] rounded-2xl bg-red-50 flex items-center justify-center mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-[18px] font-bold text-[#111110] tracking-[-0.02em] mb-2">
        Failed to load document
      </h3>
      <p className="text-[13px] text-[#7a7975] text-center max-w-[360px] leading-[1.6] mb-6">
        {message || "Something went wrong. Please try again."}
      </p>
      <button onClick={onRetry} className="flex items-center gap-2 bg-[#111110] text-white border-none rounded-[10px] py-[11px] px-6 font-[Sora,sans-serif] text-[13px] font-semibold cursor-pointer tracking-[-0.01em] transition-all duration-[180ms] hover:bg-[#222] hover:-translate-y-[1.5px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        Retry
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  EDITOR COMPONENT                                                      */
/* ═══════════════════════════════════════════════════════════════════════ */
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
  const [creating, setCreating] = useState(false);
  const [activeNav, setActiveNav] = useState("All Documents");
  const [showShareModal, setShowShareModal] = useState(false);

  /* ── Presence ── */
  const [activeUsers, setActiveUsers] = useState([]);
  const [showPresencePanel, setShowPresencePanel] = useState(false);
  const presencePanelRef = useRef(null);

  /* ── Refs for avoiding infinite loops ── */
  const isRemoteUpdate = useRef(false);
  
  /* ── Socket & Debounce hooks ── */
  const { emit, on } = useSocket(documentId);

  const debouncedUpdate = useDebounceCallback((newContent) => {
    emit("DOCUMENT_UPDATE", { documentId, content: newContent });
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
      on("DOCUMENT_UPDATED", ({ content: newContent }) => {
        isRemoteUpdate.current = true;
        setContent(newContent);
      }),
      on("PRESENCE_UPDATE", ({ users }) => {
        setActiveUsers(users || []);
      }),
      on("ERROR", ({ message }) => {
        console.error("[Socket Error]", message);
      })
    ];

    return () => cleanupHandlers.forEach(cleanup => cleanup && cleanup());
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


  /* ── Click outside to close presence panel ── */
  useEffect(() => {
    function handleClickOutside(e) {
      if (presencePanelRef.current && !presencePanelRef.current.contains(e.target)) {
        setShowPresencePanel(false);
      }
    }
    if (showPresencePanel) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPresencePanel]);

  /* ── Formatting toolbar actions ── */
  const textareaRef = useRef(null);

  const wrapSelection = useCallback((before, after) => {
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
  }, [debouncedUpdate]);

  /* ── Create new document (from sidebar) ── */
  const handleCreateNew = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const res = await documentService.createDocument("Untitled Document");
      const newDoc = res.data?.document || res.data;
      const docId = newDoc?.id || newDoc?._id;
      if (!docId) throw new Error("Invalid response: missing document ID");
      navigate(`/editor/${docId}`);
    } catch (err) {
      console.error("Failed to create document:", err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen font-[Sora,sans-serif] bg-[#f4f4f2] text-[#111110]">
      {/* ── Fonts & Animations ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');
        .font-sora { font-family: 'Sora', sans-serif; }
        .font-serif-display { font-family: 'DM Serif Display', serif; }
        .font-editor { font-family: 'Lora', 'Georgia', serif; }
        @keyframes ed-fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ed-fade-up { animation: ed-fadeUp 0.4s cubic-bezier(.22,.8,.44,1) both; }
        @keyframes ed-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .ed-saving { animation: ed-pulse 1.5s ease-in-out infinite; }
        @keyframes presence-slide-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes online-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.45); }
          50% { box-shadow: 0 0 0 4px rgba(34,197,94,0); }
        }
        .presence-panel {
          animation: presence-slide-in 0.22s cubic-bezier(.22,.8,.44,1) both;
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          z-index: 50;
          width: 260px;
          background: white;
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
          overflow: hidden;
        }
        .presence-panel-header {
          padding: 14px 16px 10px;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .presence-panel-header h4 {
          margin: 0;
          font-size: 12px;
          font-weight: 700;
          color: #111110;
          letter-spacing: -0.01em;
          font-family: 'Sora', sans-serif;
        }
        .presence-panel-header span {
          font-size: 10px;
          font-weight: 600;
          color: #22c55e;
          background: rgba(34,197,94,0.1);
          padding: 2px 8px;
          border-radius: 20px;
          letter-spacing: 0.02em;
        }
        .presence-user-list {
          padding: 6px 0;
          max-height: 240px;
          overflow-y: auto;
        }
        .presence-user-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          transition: background 0.15s;
          cursor: default;
        }
        .presence-user-item:hover {
          background: rgba(0,0,0,0.025);
        }
        .presence-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: white;
          position: relative;
          flex-shrink: 0;
        }
        .presence-online-dot {
          position: absolute;
          bottom: -1px;
          right: -1px;
          width: 10px;
          height: 10px;
          background: #22c55e;
          border-radius: 50%;
          border: 2px solid white;
          animation: online-pulse 2s ease-in-out infinite;
        }
        .presence-user-name {
          font-size: 13px;
          font-weight: 600;
          color: #111110;
          font-family: 'Sora', sans-serif;
          letter-spacing: -0.01em;
        }
        .presence-user-status {
          font-size: 10px;
          color: #22c55e;
          font-weight: 500;
          font-family: 'Sora', sans-serif;
        }
        .avatar-stack-btn {
          display: flex;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 24px;
          transition: background 0.15s;
          position: relative;
        }
        .avatar-stack-btn:hover {
          background: rgba(0,0,0,0.04);
        }
        textarea.editor-area {
          font-family: 'Lora', 'Georgia', serif;
          font-size: 16px;
          line-height: 1.85;
          color: #2c2c2a;
          resize: none;
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          min-height: calc(100vh - 320px);
        }
        textarea.editor-area::placeholder {
          color: #c8c7c2;
        }
        input.title-input {
          font-family: 'DM Serif Display', serif;
          font-size: 38px;
          font-weight: 400;
          color: #111110;
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          letter-spacing: -0.02em;
          line-height: 1.15;
        }
        input.title-input::placeholder {
          color: #c8c7c2;
        }
      `}</style>

      {/* ── SIDEBAR (shared component) ── */}
      <Sidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        onCreateNew={handleCreateNew}
        creating={creating}
      />

      {/* ── MAIN ── */}
      <main className="ml-[210px] flex-1 flex flex-col min-h-screen">
        {/* ── TOP BAR ── */}
        <div className="sticky top-0 z-[9] bg-[rgba(244,244,242,0.92)] backdrop-blur-[12px] border-b border-[rgba(0,0,0,0.07)] flex items-center gap-4 py-[10px] px-6">
          {/* Back */}
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-[6px] text-[13px] font-medium text-[#7a7975] bg-transparent border-none cursor-pointer transition-colors duration-150 hover:text-[#111110]"
          >
            <BackIcon />
          </button>

          {/* Tabs */}
          <div className="flex items-center gap-[18px] ml-2">
            <span className="text-[13px] font-semibold text-[#111110] border-b-2 border-[#111110] pb-[10px] pt-[10px] cursor-pointer">
              Documents
            </span>
            <span className="text-[13px] font-medium text-[#b0afa8] pb-[10px] pt-[10px] cursor-pointer transition-colors duration-150 hover:text-[#7a7975]">
              Templates
            </span>
          </div>

          <div className="flex-1" />

          {/* Active Users (Presence) */}
          {activeUsers.length > 0 && (
            <div ref={presencePanelRef} style={{ position: 'relative' }}>
              <button
                className="avatar-stack-btn"
                onClick={() => setShowPresencePanel((v) => !v)}
                title="View active users"
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {activeUsers.slice(0, 4).map((user, i) => (
                    <div
                      key={user.userId || i}
                      title={user.username || "Anonymous"}
                      style={{
                        width: 30, height: 30, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: 'white',
                        border: '2px solid white', flexShrink: 0,
                        backgroundColor: getAvatarColor(i), zIndex: 10 - i,
                        marginLeft: i > 0 ? -8 : 0,
                        transition: 'transform 0.15s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {getInitial(user.username)}
                    </div>
                  ))}
                  {activeUsers.length > 4 && (
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 600, color: '#7a7975',
                      background: '#eeedea', border: '2px solid white',
                      marginLeft: -8,
                    }}>
                      +{activeUsers.length - 4}
                    </div>
                  )}
                </div>
                <div style={{
                  marginLeft: 8, fontSize: 11, fontWeight: 600, color: '#7a7975',
                  fontFamily: "'Sora', sans-serif",
                }}>
                  {activeUsers.length} online
                </div>
              </button>

              {/* ── Presence Dropdown Panel ── */}
              {showPresencePanel && (
                <div className="presence-panel">
                  <div className="presence-panel-header">
                    <h4>Active Users</h4>
                    <span>{activeUsers.length} online</span>
                  </div>
                  <div className="presence-user-list">
                    {activeUsers.map((user, i) => (
                      <div key={user.userId || i} className="presence-user-item">
                        <div
                          className="presence-avatar"
                          style={{ backgroundColor: getAvatarColor(i) }}
                        >
                          {getInitial(user.username)}
                          <div className="presence-online-dot" />
                        </div>
                        <div>
                          <div className="presence-user-name">
                            {user.username || "Anonymous"}
                          </div>
                          <div className="presence-user-status">Online</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Share Button */}
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-[6px] bg-[#111110] text-white border-none rounded-[8px] py-[7px] px-[14px] text-[12px] font-semibold cursor-pointer tracking-[-0.01em] transition-all duration-[180ms] hover:bg-[#222] hover:-translate-y-[1px] hover:shadow-[0_4px_14px_rgba(0,0,0,0.15)]"
          >
            Share
          </button>

          {/* Icons */}
          <button
            title="Notifications"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-transparent border border-[rgba(0,0,0,0.07)] text-[#7a7975] cursor-pointer transition-all duration-150 hover:bg-[#111110] hover:text-white hover:border-[#111110]"
          >
            <BellIcon />
          </button>
          <button
            title="Settings"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-transparent border border-[rgba(0,0,0,0.07)] text-[#7a7975] cursor-pointer transition-all duration-150 hover:bg-[#111110] hover:text-white hover:border-[#111110]"
          >
            <SettingsIcon />
          </button>
        </div>

        {/* ── EDITOR CONTENT ── */}
        <div className="flex-1 flex flex-col">
          {loading ? (
            <EditorSkeleton />
          ) : error ? (
            <EditorError message={error} onRetry={fetchDocument} />
          ) : (
            <>
              {/* Document surface */}
              <div className="flex-1 bg-white mx-6 my-6 rounded-[16px] border border-[rgba(0,0,0,0.06)] shadow-[0_2px_20px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col ed-fade-up">
                {/* Editor area */}
                <div className="flex-1 overflow-auto">
                  <div className="max-w-[720px] mx-auto py-14 px-10">
                    {/* Title */}
                    <input
                      type="text"
                      className="title-input"
                      value={title}
                      onChange={handleTitleChange}
                      placeholder="Untitled Document"
                    />

                    {/* Meta */}
                    <div className="flex items-center gap-3 mt-3 mb-10">
                      <span className="text-[11px] text-[#b0afa8] font-medium tracking-[0.04em] uppercase">
                        Last edited {formatRelativeTime(doc?.updatedAt)}
                      </span>
                      {activeUsers.length > 0 && (
                        <>
                          <span className="text-[11px] text-[#d0cfc8]">•</span>
                          <span className="text-[11px] text-[#b0afa8] font-medium tracking-[0.04em] uppercase">
                            {activeUsers.length} online now
                          </span>
                        </>
                      )}
                      {saving && (
                        <>
                          <span className="text-[11px] text-[#d0cfc8]">•</span>
                          <span className="text-[11px] text-[#2a5cff] font-medium tracking-[0.04em] uppercase ed-saving">
                            Saving…
                          </span>
                        </>
                      )}
                    </div>

                    {/* Content */}
                    <textarea
                      ref={textareaRef}
                      className="editor-area"
                      value={content}
                      onChange={handleContentChange}
                      placeholder="Start writing your story…"
                    />
                  </div>
                </div>

                {/* ── Footer ── */}
                <footer className="border-t border-[rgba(0,0,0,0.06)] px-7 py-[14px] flex items-center justify-between">
                  <span className="text-[10px] text-[#b0afa8] tracking-[0.06em] uppercase">
                    © 2024 SyncWrite. Built for Creators.
                  </span>
                  <nav className="flex gap-[18px]">
                    {["Privacy", "Terms", "Contact"].map((l) => (
                      <a key={l} href="#" className="text-[10px] font-semibold tracking-[0.09em] uppercase text-[#b0afa8] no-underline transition-colors duration-150 hover:text-[#111110]">
                        {l}
                      </a>
                    ))}
                  </nav>
                </footer>
              </div>

              {/* ── FORMATTING TOOLBAR ── */}
              <div className="sticky bottom-0 z-[8] bg-[rgba(244,244,242,0.95)] backdrop-blur-[12px] border-t border-[rgba(0,0,0,0.07)] flex items-center justify-center gap-1 py-[10px] px-6">
                {[
                  { icon: <BoldIcon />, title: "Bold", action: () => wrapSelection("**", "**") },
                  { icon: <ItalicIcon />, title: "Italic", action: () => wrapSelection("*", "*") },
                  { icon: <UnderlineIcon />, title: "Underline", action: () => wrapSelection("<u>", "</u>") },
                  { icon: <ListIcon />, title: "List", action: () => wrapSelection("- ", "") },
                  { icon: <QuoteIcon />, title: "Quote", action: () => wrapSelection("> ", "") },
                  { icon: <PlusIcon />, title: "Insert", action: () => {} },
                ].map((btn) => (
                  <button
                    key={btn.title}
                    title={btn.title}
                    onClick={btn.action}
                    className="w-10 h-10 rounded-lg flex items-center justify-center bg-transparent border-none text-[#7a7975] cursor-pointer transition-all duration-150 hover:bg-white hover:text-[#111110] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                  >
                    {btn.icon}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          documentId={documentId}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}