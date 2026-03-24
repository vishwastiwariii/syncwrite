import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { documentService } from "../services/document.service";
import DocumentCard from "../components/DocumentCard";

/* ─── Icons ───────────────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b0afa8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
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
const GridIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);
const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

/* ─── Nav Items ───────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    label: "All Documents",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    label: "Shared with me",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Templates",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  {
    label: "Trash",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
      </svg>
    ),
  },
];

/* ─── Skeleton Loader ─────────────────────────────────────────────────── */
function SkeletonCard({ isGrid }) {
  return (
    <div
      className={`bg-white border border-[rgba(0,0,0,0.05)] rounded-[14px] animate-pulse ${
        isGrid
          ? "p-[22px_20px_18px]"
          : "flex items-center gap-4 py-[14px] px-[18px]"
      }`}
    >
      <div className={`${isGrid ? "mb-4" : "shrink-0"}`}>
        <div className="w-[42px] h-[42px] rounded-[10px] bg-[#eef1ff]/60" />
      </div>
      <div className={isGrid ? "" : "flex-1"}>
        <div className={`h-[14px] bg-[#e8e8e4] rounded-md ${isGrid ? "w-3/4 mb-3" : "w-1/2 mb-[6px]"}`} />
        <div className="h-[10px] bg-[#f0efeb] rounded-md w-1/3" />
      </div>
    </div>
  );
}

function SkeletonGrid({ viewMode }) {
  const isGrid = viewMode === "grid";
  return (
    <div className={isGrid ? "grid grid-cols-3 gap-4" : "grid grid-cols-1 gap-2"}>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} isGrid={isGrid} />
      ))}
    </div>
  );
}

/* ─── Error Banner ────────────────────────────────────────────────────── */
function ErrorBanner({ message, onRetry }) {
  return (
    <div className="sw-fade-up flex flex-col items-center justify-center py-16 px-8">
      <div className="w-[72px] h-[72px] rounded-2xl bg-red-50 flex items-center justify-center mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-[18px] font-bold text-[#111110] tracking-[-0.02em] mb-2">
        Something went wrong
      </h3>
      <p className="text-[13px] text-[#7a7975] text-center max-w-[360px] leading-[1.6] mb-6">
        {message || "We couldn't load your documents. Please check your connection and try again."}
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 bg-[#111110] text-white border-none rounded-[10px] py-[11px] px-6 font-[Sora,sans-serif] text-[13px] font-semibold cursor-pointer tracking-[-0.01em] transition-all duration-[180ms] hover:bg-[#222] hover:-translate-y-[1.5px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        Retry
      </button>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  /* ── State ── */
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchVal, setSearchVal] = useState("");
  const [activeNav, setActiveNav] = useState("All Documents");

  /* ── Fetch documents on mount ── */
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await documentService.getDocuments();
      setDocuments(res.data || []);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to load documents";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  /* ── Filtered documents (search) ── */
  const filteredDocuments = useMemo(() => {
    if (!searchVal.trim()) return documents;
    const q = searchVal.toLowerCase();
    return documents.filter((doc) =>
      (doc.title || "Untitled Document").toLowerCase().includes(q)
    );
  }, [documents, searchVal]);

  /* ── Handlers ── */
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleCreateNew = async () => {
    if (creating) return; // prevent double click
    setCreating(true);
    try {
      const res = await documentService.createDocument("Untitled Document");
      const newDoc = res.data;
      setDocuments((prev) => [newDoc, ...prev]);
      navigate(`/editor/${newDoc._id}`);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to create document";
      setError(message);
    } finally {
      setCreating(false);
    }
  };

  const handleCardClick = (docId) => {
    navigate(`/editor/${docId}`);
  };

  /* ── Render content section ── */
  const renderDocumentSection = () => {
    if (loading) {
      return <SkeletonGrid viewMode={viewMode} />;
    }

    if (error) {
      return <ErrorBanner message={error} onRetry={fetchDocuments} />;
    }

    if (filteredDocuments.length === 0 && searchVal.trim()) {
      return (
        <div className="sw-fade-up flex flex-col items-center justify-center py-16 px-8">
          <div className="w-[72px] h-[72px] rounded-2xl bg-[#f4f4f2] flex items-center justify-center mb-6">
            <SearchIcon />
          </div>
          <h3 className="text-[18px] font-bold text-[#111110] tracking-[-0.02em] mb-2">
            No results found
          </h3>
          <p className="text-[13px] text-[#7a7975] text-center max-w-[320px] leading-[1.6]">
            No documents match "<span className="font-semibold text-[#111110]">{searchVal}</span>". Try a different search term.
          </p>
        </div>
      );
    }

    if (documents.length === 0) {
      return (
        <div className="sw-fade-up flex flex-col items-center justify-center py-20 px-8">
          <div className="w-[72px] h-[72px] rounded-2xl bg-[#eef1ff] flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2a5cff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <h3 className="text-[18px] font-bold text-[#111110] tracking-[-0.02em] mb-2">
            No documents yet
          </h3>
          <p className="text-[13px] text-[#7a7975] text-center max-w-[320px] leading-[1.6] mb-6">
            Your workspace is empty. Create your first document to start writing and collaborating.
          </p>
          <button
            onClick={handleCreateNew}
            disabled={creating}
            className="flex items-center gap-2 bg-[#111110] text-white border-none rounded-[10px] py-[11px] px-6 font-[Sora,sans-serif] text-[13px] font-semibold cursor-pointer tracking-[-0.01em] transition-all duration-[180ms] hover:bg-[#222] hover:-translate-y-[1.5px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-[16px] leading-none">+</span>
            {creating ? "Creating…" : "Create your first document"}
          </button>
        </div>
      );
    }

    return (
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-3 gap-4"
            : "grid grid-cols-1 gap-2"
        }
      >
        {filteredDocuments.map((doc) => (
          <DocumentCard
            key={doc._id}
            document={doc}
            viewMode={viewMode}
            onClick={handleCardClick}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen font-[Sora,sans-serif] bg-[#f4f4f2] text-[#111110]">
      {/* ── Fonts & Animations ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        .font-sora { font-family: 'Sora', sans-serif; }
        .font-serif-display { font-family: 'DM Serif Display', serif; }
        @keyframes sw-fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sw-fade-up { animation: sw-fadeUp 0.4s cubic-bezier(.22,.8,.44,1) both; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside className="w-[210px] bg-white border-r border-[rgba(0,0,0,0.07)] flex flex-col py-6 px-4 fixed top-0 left-0 bottom-0 z-10">
        {/* Brand */}
        <div className="mb-7 px-1">
          <div className="text-[17px] font-bold text-[#111110] tracking-[-0.03em] leading-[1.1]">
            SyncWrite
          </div>
          <div className="text-[11px] text-[#7a7975] font-normal mt-[3px] tracking-[0.01em]">
            Collaborative Workspace
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreateNew}
          disabled={creating}
          className="flex items-center justify-center gap-[7px] bg-[#111110] text-white border-none rounded-[10px] py-[11px] px-4 w-full font-[Sora,sans-serif] text-[13px] font-semibold cursor-pointer tracking-[-0.01em] mb-7 transition-all duration-[180ms] hover:bg-[#222] hover:-translate-y-[1.5px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-[16px] leading-none">{creating ? "⟳" : "+"}</span>
          {creating ? "Creating…" : "Create New"}
        </button>

        {/* Nav */}
        <nav className="flex flex-col gap-[2px]">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveNav(item.label)}
              className={`flex items-center gap-[10px] py-[9px] px-[10px] rounded-[9px] text-[13px] font-medium cursor-pointer border-none w-full text-left transition-all duration-150 ${
                item.label === activeNav
                  ? "bg-[#eef1ff] text-[#2a5cff] font-semibold"
                  : "bg-transparent text-[#7a7975] hover:bg-[#f4f4f2] hover:text-[#111110]"
              }`}
            >
              <span className="w-[18px] h-[18px] shrink-0 flex items-center justify-center">
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User */}
        <div className="flex items-center gap-[10px] py-[10px] px-2 rounded-[10px] cursor-pointer transition-colors duration-150 hover:bg-[#f4f4f2]">
          <div className="w-8 h-8 rounded-full bg-[#2a5cff] text-white flex items-center justify-center text-[12px] font-bold shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-[#111110] leading-[1.2]">My Account</div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-2 flex items-center gap-[10px] py-[9px] px-[10px] rounded-[9px] text-[13px] font-medium cursor-pointer border-none w-full text-left bg-transparent text-[#7a7975] transition-all duration-150 hover:bg-red-50 hover:text-red-500"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </aside>

      {/* ── MAIN ── */}
      <main className="ml-[210px] flex-1 flex flex-col min-h-screen">
        {/* ── TOPBAR ── */}
        <div className="sticky top-0 z-[9] bg-[rgba(244,244,242,0.9)] backdrop-blur-[12px] border-b border-[rgba(0,0,0,0.07)] flex items-center gap-4 py-3 px-7">
          {/* Search */}
          <div className="flex-1 max-w-[480px] flex items-center gap-[10px] bg-white border border-[rgba(0,0,0,0.07)] rounded-[10px] py-[9px] px-[14px] transition-all duration-[180ms] focus-within:border-[rgba(42,92,255,0.35)] focus-within:shadow-[0_0_0_3px_rgba(42,92,255,0.08)]">
            <SearchIcon />
            <input
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search your documents…"
              className="border-none outline-none bg-transparent font-[Sora,sans-serif] text-[13px] text-[#111110] flex-1 placeholder:text-[#b0afa8]"
            />
          </div>

          <div className="flex-1" />

          {/* Topbar icons */}
          <button
            title="Notifications"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-[rgba(0,0,0,0.07)] text-[#7a7975] cursor-pointer transition-all duration-150 hover:bg-[#111110] hover:text-white hover:border-[#111110]"
          >
            <BellIcon />
          </button>
          <button
            title="Settings"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-[rgba(0,0,0,0.07)] text-[#7a7975] cursor-pointer transition-all duration-150 hover:bg-[#111110] hover:text-white hover:border-[#111110]"
          >
            <SettingsIcon />
          </button>
        </div>

        {/* ── CONTENT ── */}
        <div className="py-9 px-7 pb-12">
          {/* ── New Document Section ── */}
          <h2 className="font-serif-display text-[26px] font-normal tracking-[-0.02em] mb-[6px]">
            Start a new document
          </h2>
          <p className="text-[13px] text-[#7a7975] font-normal mb-6">
            Create a blank document or choose a template to get started.
          </p>

          {/* Create blank doc card */}
          <div className="flex gap-[14px] mb-12">
            <div
              onClick={handleCreateNew}
              className={`shrink-0 w-[140px] cursor-pointer sw-fade-up ${creating ? "pointer-events-none opacity-50" : ""}`}
            >
              <div className="w-[140px] h-[170px] rounded-xl mb-[10px] flex items-center justify-center border-[1.5px] border-dashed border-[#d0cfc8] bg-white transition-all duration-[180ms] hover:border-[rgba(42,92,255,0.35)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.1)] hover:-translate-y-[2px]">
                <span className="text-[28px] text-[#ccc] font-light">{creating ? "⟳" : "+"}</span>
              </div>
              <div className="text-[13px] font-semibold text-[#111110] tracking-[-0.01em]">
                Blank document
              </div>
              <div className="text-[11px] text-[#7a7975] mt-[2px]">Start from zero</div>
            </div>
          </div>

          {/* ── Recent Documents ── */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif-display text-[22px] font-normal tracking-[-0.02em]">
              Recent Documents
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-150 ${
                  viewMode === "grid"
                    ? "bg-[#111110] text-white border border-[#111110]"
                    : "bg-transparent text-[#7a7975] border border-[rgba(0,0,0,0.07)] hover:bg-[#f0efeb] hover:text-[#111110]"
                }`}
              >
                <GridIcon />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-150 ${
                  viewMode === "list"
                    ? "bg-[#111110] text-white border border-[#111110]"
                    : "bg-transparent text-[#7a7975] border border-[rgba(0,0,0,0.07)] hover:bg-[#f0efeb] hover:text-[#111110]"
                }`}
              >
                <ListIcon />
              </button>
            </div>
          </div>

          {/* ── Document Section (loading / error / empty / list) ── */}
          {renderDocumentSection()}
        </div>
      </main>
    </div>
  );
}
