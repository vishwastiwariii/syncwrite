import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { documentService } from "../services/document.service";
import DocumentCard from "../components/DocumentCard";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { formatDate, wordCount } from "../utils/document";

/* ─── Icons ───────────────────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const greetingFor = (d = new Date()) => {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

/* ─── Small building blocks ───────────────────────────────────────────────── */
function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-sw-line bg-sw-surface p-5 ${className}`}>
      {children}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-sw-line bg-sw-surface">
      <div className="h-24 animate-pulse bg-sw-violet-2" />
      <div className="px-[15px] py-3">
        <div className="mb-2 h-3 w-3/4 animate-pulse rounded bg-sw-line" />
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-sw-line-2" />
      </div>
    </div>
  );
}

function EmptyState({ title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-sw-line bg-sw-surface px-8 py-16 text-center">
      <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-sw-violet-soft text-sw-violet">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      </div>
      <h3 className="font-serif text-[22px] font-medium text-sw-ink">{title}</h3>
      <p className="mt-2 max-w-[340px] text-[14px] leading-[1.6] text-sw-muted">{body}</p>
      {action}
    </div>
  );
}

/* ─── Dashboard ───────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const { user, userId } = useAuth();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [activeNav, setActiveNav] = useState("All Documents");

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await documentService.getDocuments();
      setDocuments(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const isOwned = useCallback(
    (doc) => {
      const ownerId = doc.createdBy?._id || doc.createdBy;
      return ownerId?.toString() === userId?.toString();
    },
    [userId]
  );

  /* Owned vs shared, per sidebar selection. */
  const navFiltered = useMemo(() => {
    if (!userId) return documents;
    if (activeNav === "Shared with me") return documents.filter((d) => !isOwned(d));
    if (activeNav === "All Documents") return documents.filter(isOwned);
    return [];
  }, [documents, activeNav, userId, isOwned]);

  const filtered = useMemo(() => {
    const q = searchVal.trim().toLowerCase();
    if (!q) return navFiltered;
    return navFiltered.filter((d) => (d.title || "Untitled Document").toLowerCase().includes(q));
  }, [navFiltered, searchVal]);

  /* Real stats derived from the documents payload. */
  const stats = useMemo(() => {
    const recent = documents.filter((d) => Date.now() - new Date(d.updatedAt) < WEEK_MS);
    // Scope the headline number to documents actually touched this week, so the
    // "This week" card can't report a lifetime total.
    const recentWords = recent.reduce((sum, d) => sum + wordCount(d.content), 0);
    const shared = documents.filter((d) => !isOwned(d)).length;
    return {
      recentWords,
      docs: documents.length,
      recent: recent.length,
      shared,
      pct: documents.length ? Math.round((recent.length / documents.length) * 100) : 0,
    };
  }, [documents, isOwned]);

  const continueWriting = useMemo(() => documents.slice(0, 3), [documents]);

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
      setError(err?.response?.data?.message || err?.message || "Failed to create document");
    } finally {
      setCreating(false);
    }
  };

  const openDoc = (id) => navigate(`/editor/${id}`);
  const firstName = (user?.name || "").trim().split(/\s+/)[0];
  const searching = searchVal.trim().length > 0;
  const showOverview = !searching && activeNav === "All Documents";

  return (
    <div className="min-h-screen bg-sw-bg text-sw-ink">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      <main className="ml-[240px] min-h-screen bg-sw-surface px-8 py-7 lg:px-9">
        {/* Top row */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <label className="flex w-full max-w-[300px] items-center gap-2 rounded-full border border-sw-line bg-sw-violet-2 px-4 py-[9px] text-sw-faint transition-colors focus-within:border-sw-violet">
            <SearchIcon />
            <input
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search everything…"
              className="w-full bg-transparent text-[13.5px] text-sw-ink outline-none placeholder:text-sw-faint"
            />
          </label>
          <button
            onClick={handleCreateNew}
            disabled={creating}
            className="rounded-full bg-sw-ink px-[18px] py-[11px] text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
          >
            {creating ? "Creating…" : "+ New document"}
          </button>
        </div>

        {/* Greeting */}
        <h1 className="font-serif text-[34px] font-medium tracking-[-0.01em]">
          {greetingFor()}{firstName ? `, ${firstName}` : ""}.
        </h1>
        <p className="mt-1 text-[15px] text-sw-muted">
          {loading
            ? "Loading your workspace…"
            : `You have ${stats.docs} ${stats.docs === 1 ? "document" : "documents"}${
                stats.shared ? ` · ${stats.shared} shared with you` : ""
              }.`}
        </p>

        {error && (
          <div role="alert" className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-[#f5c2c7] bg-[#fdeaec] px-4 py-3 text-[13.5px] font-medium text-[#b42318]">
            {error}
            <button onClick={fetchDocuments} className="shrink-0 rounded-full bg-[#b42318] px-3 py-1.5 text-[12px] font-semibold text-white">
              Retry
            </button>
          </div>
        )}

        {/* ── Overview: continue writing + activity/stats ── */}
        {showOverview && (
          <>
            <div className="mb-3.5 mt-7 flex items-center justify-between">
              <div className="text-[15px] font-semibold">Continue writing</div>
              {documents.length > 3 && (
                <span className="text-[13px] font-semibold text-sw-violet">
                  {documents.length} total
                </span>
              )}
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
                : continueWriting.map((doc, i) => (
                    <DocumentCard key={doc._id} document={doc} index={i} onClick={openDoc} />
                  ))}
            </div>

            {!loading && documents.length > 0 && (
              <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                {/* Recent activity — derived from real document timestamps */}
                <Card>
                  <div className="mb-3.5 text-[14px] font-semibold">Recent activity</div>
                  <div className="flex flex-col gap-3.5">
                    {documents.slice(0, 3).map((doc, i) => (
                      <div key={doc._id} className="flex items-center gap-3">
                        <span
                          className="h-[30px] w-[30px] shrink-0 rounded-full border border-sw-line"
                          style={{ background: ["#EDEBFF", "#EAF7F0", "#FBF1E4"][i % 3] }}
                        />
                        <div className="min-w-0 text-[13px] text-sw-muted">
                          <div className="truncate">
                            {isOwned(doc) ? "You edited " : "Shared with you · "}
                            <b className="text-sw-ink">{doc.title || "Untitled Document"}</b>
                          </div>
                          <div className="text-[11.5px] text-sw-faint">
                            {formatDate(doc.updatedAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* This week — real counts */}
                <Card className="flex flex-col gap-4">
                  <div className="text-[14px] font-semibold">This week</div>
                  <div>
                    <div className="font-serif text-[34px] font-medium leading-none">
                      {stats.recentWords.toLocaleString()}
                    </div>
                    <div className="mt-1 text-[12.5px] text-sw-faint">
                      words in docs you edited
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div>
                      <div className="font-serif text-[26px] font-medium leading-none">{stats.recent}</div>
                      <div className="mt-1 text-[12px] text-sw-faint">edited</div>
                    </div>
                    <div>
                      <div className="font-serif text-[26px] font-medium leading-none">{stats.docs}</div>
                      <div className="mt-1 text-[12px] text-sw-faint">docs total</div>
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-sw-violet-2">
                    <div className="h-full rounded-full bg-sw-violet" style={{ width: `${stats.pct}%` }} />
                  </div>
                </Card>
              </div>
            )}
          </>
        )}

        {/* ── Document list ── */}
        <div className="mb-3.5 mt-8 flex items-center justify-between">
          <div className="text-[15px] font-semibold">
            {searching ? "Search results" : activeNav}
          </div>
          {!loading && <span className="text-[13px] text-sw-faint">{filtered.length}</span>}
        </div>

        {loading ? (
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : activeNav === "Templates" || activeNav === "Trash" ? (
          <EmptyState
            title={`${activeNav} coming soon`}
            body={`${activeNav} isn't wired up yet. Your documents live under All Documents.`}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={searching ? "No results found" : "No documents yet"}
            body={
              searching
                ? `No documents match “${searchVal}”. Try a different search term.`
                : "Your workspace is empty. Create your first document to start writing and collaborating."
            }
            action={
              !searching && (
                <button
                  onClick={handleCreateNew}
                  disabled={creating}
                  className="mt-5 rounded-full bg-sw-ink px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-black disabled:opacity-70"
                >
                  {creating ? "Creating…" : "Create your first document"}
                </button>
              )
            }
          />
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((doc, i) => (
              <DocumentCard key={doc._id} document={doc} index={i} onClick={openDoc} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
