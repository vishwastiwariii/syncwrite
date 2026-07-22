import React, { useState } from "react";

/* ─── Shared "Coming soon" badge ─────────────────────────────────────────── */
export function ComingSoon({ className = "" }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-sw-violet-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-sw-violet ${className}`}
    >
      Coming soon
    </span>
  );
}

/* ─── Icons — Lucide monoline, sized to the reference's 42px tiles ───────── */
const svg = (children, size = 19) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const mk = (children) => (size) => svg(children, size);

const Icon = {
  sparkle: mk(
    <>
      <path d="M9.94 14.06A2 2 0 0 0 8.5 12.62l-5.14-1.32a.42.42 0 0 1 0-.8L8.5 9.18a2 2 0 0 0 1.44-1.44l1.32-5.14a.42.42 0 0 1 .8 0l1.32 5.14a2 2 0 0 0 1.44 1.44l5.14 1.32a.42.42 0 0 1 0 .8l-5.14 1.32a2 2 0 0 0-1.44 1.44l-1.32 5.14a.42.42 0 0 1-.8 0z" />
      <path d="M20 3v4M22 5h-4M4 17v2M5 18H3" />
    </>
  ),
  cursor: mk(<path d="M4.04 4.69a.5.5 0 0 1 .65-.65l15.14 6.15a.5.5 0 0 1-.06.94l-6.12 1.58a1 1 0 0 0-.72.72l-1.58 6.12a.5.5 0 0 1-.94.06z" />),
  comment: mk(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />),
  history: mk(
    <>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </>
  ),
  slash: mk(
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 15 15 9" />
    </>
  ),
  template: mk(
    <>
      <rect x="3" y="3" width="18" height="7" rx="1" />
      <rect x="3" y="14" width="9" height="7" rx="1" />
      <rect x="16" y="14" width="5" height="7" rx="1" />
    </>
  ),
  layers: mk(
    <>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m6.08 10.37-3.48 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59" />
    </>
  ),
  send: mk(
    <>
      <path d="M14.54 3.28 20.72 9.46a2 2 0 0 1 0 2.83l-7.07 7.07a2 2 0 0 1-2.83 0L4.64 13.17" />
      <path d="M3 21 21 3" />
    </>
  ),
};

/* ─── Tab panels (copy verbatim from the design system) ─────────────────── */
const PANELS = [
  {
    label: "AI Assist",
    icon: Icon.sparkle,
    comingSoon: true,
    title: "An AI that writes in your voice",
    body: "Highlight any passage and ask SyncWrite to rewrite, expand, summarise, or shift tone — right where you are working, never in a separate window.",
    bullets: ["Inline rewrite, expand & shorten", "Tone and length controls", "Cited research drafts"],
    visual: "AI inline toolbar preview",
  },
  {
    label: "Collaborate",
    icon: Icon.cursor,
    title: "Everyone on the same page",
    body: "See live cursors, leave threaded comments, and co-write in the same document — with your team and the AI — without a single merge conflict.",
    bullets: ["Live multiplayer cursors", "Threaded comments & @mentions", "Suggestions and track changes"],
    visual: "Live collaboration preview",
  },
  {
    label: "Organize",
    icon: Icon.layers,
    title: "A calm home for every draft",
    body: "Workspaces, projects, and smart folders keep blog posts, scripts, and research notes exactly where you expect to find them.",
    bullets: ["Nested projects & folders", "Instant full-text search", "Version history & restore"],
    visual: "Workspace & projects preview",
  },
  {
    label: "Publish",
    icon: Icon.send,
    title: "From draft to published in one click",
    body: "Export to Markdown, HTML, or PDF — or push straight to your blog, newsletter, and social platforms without reformatting.",
    bullets: ["One-click export anywhere", "Newsletter & blog sync", "Scheduled publishing"],
    visual: "Publish anywhere preview",
  },
];

/* ─── Feature grid (tints straight from the reference) ──────────────────── */
const FEATURES = [
  { icon: Icon.sparkle, tint: "#EDEBFF", fg: "#6C5CE7", title: "Inline AI assist", desc: "Rewrite, expand or summarise any selection without leaving the page.", comingSoon: true },
  { icon: Icon.cursor, tint: "#E7F0FF", fg: "#2B7CFF", title: "Live cursors", desc: "See exactly where every collaborator is typing, in real time." },
  { icon: Icon.comment, tint: "#E7F6EF", fg: "#28A56C", title: "Comments & threads", desc: "Discuss inline, resolve threads, and @mention your team." },
  { icon: Icon.history, tint: "#FBEFE0", fg: "#E4A13B", title: "Version history", desc: "Scrub through every save and restore any draft in a click." },
  { icon: Icon.slash, tint: "#FCE9F0", fg: "#E15A7E", title: "Slash commands", desc: "Type “/” to drop in headings, tables, media and AI blocks.", comingSoon: true },
  { icon: Icon.template, tint: "#EDEBFF", fg: "#6C5CE7", title: "Smart templates", desc: "Start any piece from a pre-built, structured template.", comingSoon: true },
];

const stripes =
  "repeating-linear-gradient(45deg,#fff,#fff 12px,#faf9ff 12px,#faf9ff 24px)";

/* ─── Section ────────────────────────────────────────────────────────────── */
export default function Features() {
  const [tab, setTab] = useState(0);
  const p = PANELS[tab];

  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-[1120px]">
        {/* Header */}
        <div className="mx-auto mb-11 max-w-[640px] text-center">
          <span className="text-[14px] font-semibold tracking-[0.02em] text-sw-violet">
            Everything, in one canvas
          </span>
          <h2 className="mt-3 mb-3.5 font-serif text-[clamp(34px,4.5vw,52px)] font-medium leading-[1.05] tracking-[-0.02em]">
            Built for the way you actually write
          </h2>
          <p className="text-[17px] leading-[1.55] text-sw-muted">
            From first spark to published piece — SyncWrite keeps drafting,
            collaboration, and organisation in a single, calm place.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-9 flex flex-wrap justify-center gap-2">
          {PANELS.map((panel, i) => (
            <button
              key={panel.label}
              onClick={() => setTab(i)}
              className={`flex items-center gap-2 rounded-full border px-5 py-[11px] text-[14.5px] font-semibold transition-all duration-150 ${
                tab === i
                  ? "border-sw-ink bg-sw-ink text-white"
                  : "border-sw-line bg-sw-surface text-sw-muted hover:text-sw-ink"
              }`}
            >
              <span className={tab === i ? "text-white" : "text-sw-faint"}>
                {panel.icon(16)}
              </span>
              {panel.label}
              {panel.comingSoon && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] ${
                    tab === i ? "bg-white/20 text-white" : "bg-sw-violet-soft text-sw-violet"
                  }`}
                >
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="grid items-center gap-8 rounded-3xl border border-sw-line bg-sw-violet-2 p-7 sm:p-11 md:grid-cols-[1fr_1.05fr] md:gap-11">
          <div>
            {p.comingSoon && <ComingSoon className="mb-4" />}
            <h3 className="font-serif text-[32px] font-medium leading-[1.1] tracking-[-0.01em]">
              {p.title}
            </h3>
            <p className="mt-4 mb-6 text-[16px] leading-[1.6] text-sw-muted">{p.body}</p>
            <div className="flex flex-col gap-3">
              {p.bullets.map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sw-violet text-white">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </span>
                  <span className="text-[15px] font-medium">{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Striped visual placeholder */}
          <div
            className="grid aspect-[4/3] place-items-center rounded-[18px] border border-sw-line shadow-[0_30px_60px_-40px_rgba(108,92,231,0.5)]"
            style={{ background: stripes }}
          >
            <div className="text-center">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-sw-violet-soft text-sw-violet">
                {p.icon(24)}
              </div>
              <div className="text-[12px] tracking-[0.02em] text-sw-faint">
                {p.visual}
              </div>
            </div>
          </div>
        </div>

        {/* Feature grid */}
        <div className="mt-[22px] grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-[20px] border border-sw-line bg-sw-surface p-[26px]">
              <div className="mb-4 flex items-start justify-between gap-3">
                <span
                  className="grid h-[42px] w-[42px] place-items-center rounded-xl"
                  style={{ background: f.tint, color: f.fg }}
                >
                  {f.icon(19)}
                </span>
                {f.comingSoon && <ComingSoon />}
              </div>
              <div className="mb-[7px] font-serif text-[21px] font-medium">
                {f.title}
              </div>
              <p className="text-[14.5px] leading-[1.55] text-sw-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
