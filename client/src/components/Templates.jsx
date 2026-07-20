import React, { useState } from "react";

/* ─── Template data ──────────────────────────────────────────────────────
   Minimal by design: neutral tiles, no per-card accent colour. `kind` drives
   an abstract monoline preview; a few tiles carry a faint diagonal `hatch`
   for texture — matching the PDF's calm, breathing gallery.                  */
const TEMPLATES = [
  { name: "Blog post", category: "Writing", kind: "doc" },
  { name: "Newsletter", category: "Writing", kind: "doc", hatch: true },
  { name: "Research memo", category: "Docs", kind: "list" },
  { name: "Meeting notes", category: "Notes", kind: "note" },
  { name: "Product spec", category: "Docs", kind: "list", hatch: true },
  { name: "YouTube script", category: "Social", kind: "script" },
  { name: "LinkedIn post", category: "Social", kind: "social" },
  { name: "Lecture notes", category: "Academic", kind: "note", hatch: true },
];

const CATEGORIES = ["All", "Writing", "Docs", "Notes", "Social", "Academic"];

/* Neutral ink scale — the only colours the previews use. */
const INK = {
  title: "rgba(23,22,29,0.24)",
  line: "rgba(23,22,29,0.10)",
  faint: "rgba(23,22,29,0.055)",
  mark: "rgba(23,22,29,0.28)",
};

/* ─── Abstract preview thumbnails (monochrome) ──────────────────────────── */
function Bar({ w, c, h = 7 }) {
  return <div className="rounded-full" style={{ width: w, height: h, background: c }} />;
}

function Preview({ kind }) {
  if (kind === "doc") {
    return (
      <div className="flex h-full w-full flex-col gap-2 px-6 py-7">
        <Bar w="52%" c={INK.title} h={10} />
        <div className="mt-1.5 space-y-2">
          {["100%", "94%", "97%", "68%"].map((w, i) => <Bar key={i} w={w} c={INK.line} />)}
        </div>
      </div>
    );
  }
  if (kind === "list") {
    return (
      <div className="flex h-full w-full flex-col gap-2.5 px-6 py-7">
        <Bar w="44%" c={INK.title} h={10} />
        {[86, 78, 70].map((w, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="h-3.5 w-3.5 shrink-0 rounded-[5px] border" style={{ borderColor: INK.line }} />
            <Bar w={`${w}%`} c={INK.faint} />
          </div>
        ))}
      </div>
    );
  }
  if (kind === "note") {
    return (
      <div className="flex h-full w-full flex-col gap-2.5 px-6 py-7">
        <Bar w="38%" c={INK.title} h={10} />
        {[90, 82, 74, 56].map((w, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: INK.mark }} />
            <Bar w={`${w}%`} c={INK.line} />
          </div>
        ))}
      </div>
    );
  }
  if (kind === "social") {
    return (
      <div className="flex h-full w-full flex-col gap-3.5 px-6 py-7">
        <div className="flex items-center gap-2.5">
          <span className="h-9 w-9 rounded-full" style={{ background: INK.line }} />
          <div className="space-y-1.5">
            <Bar w="64px" c={INK.line} h={6} />
            <Bar w="42px" c={INK.faint} h={6} />
          </div>
        </div>
        <div className="space-y-2">
          {["100%", "88%", "60%"].map((w, i) => <Bar key={i} w={w} c={INK.line} />)}
        </div>
      </div>
    );
  }
  // script
  return (
    <div className="flex h-full w-full flex-col gap-3 px-6 py-7">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex items-start gap-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[10px] font-semibold" style={{ borderColor: INK.line, color: INK.mark }}>
            {n}
          </span>
          <div className="mt-0.5 flex-1 space-y-1.5">
            <Bar w="80%" c={INK.line} />
            <Bar w="52%" c={INK.faint} />
          </div>
        </div>
      ))}
    </div>
  );
}

const hatchStyle = {
  backgroundImage:
    "repeating-linear-gradient(45deg, rgba(23,22,29,0.035) 0, rgba(23,22,29,0.035) 1px, transparent 1px, transparent 9px)",
};

/* ─── Section ────────────────────────────────────────────────────────────── */
export default function Templates() {
  const [filter, setFilter] = useState("All");
  const shown = filter === "All" ? TEMPLATES : TEMPLATES.filter((t) => t.category === filter);

  return (
    <section id="templates" className="px-6 py-28">
      <div className="mx-auto max-w-[1120px]">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-sw-violet">
              Templates
            </span>
            <h2 className="mt-4 font-serif text-[clamp(30px,5vw,46px)] leading-[1.08] tracking-[-0.02em]">
              Templates gallery
            </h2>
            <p className="mt-4 max-w-[440px] text-[15px] leading-[1.7] text-sw-muted">
              Pre-made starting points for every format — pick one and start
              writing in seconds.
            </p>
          </div>
          <button className="rounded-full border border-sw-line px-5 py-2.5 text-[14px] font-medium text-sw-ink transition-colors duration-150 hover:bg-sw-surface">
            Request a template
          </button>
        </div>

        {/* Filter chips */}
        <div className="mt-12 flex flex-wrap gap-6 border-b border-sw-line pb-px">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`relative -mb-px pb-3 text-[14px] font-medium transition-colors duration-150 ${
                filter === c ? "text-sw-ink" : "text-sw-muted hover:text-sw-ink"
              }`}
            >
              {c}
              {filter === c && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-sw-ink" />
              )}
            </button>
          ))}
        </div>

        {/* Grid — labels sit below each tile on open space */}
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-11 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((t) => (
            <button key={t.name} className="group text-left">
              {/* Tile */}
              <div
                className="relative h-[196px] overflow-hidden rounded-2xl border border-sw-line bg-sw-surface transition-all duration-200 group-hover:-translate-y-1 group-hover:border-[rgba(23,22,29,0.16)] group-hover:shadow-[0_14px_36px_rgba(23,22,29,0.08)]"
                style={t.hatch ? hatchStyle : undefined}
              >
                <Preview kind={t.kind} />
              </div>
              {/* Label */}
              <div className="mt-3.5 flex items-center justify-between px-0.5">
                <div>
                  <div className="text-[15px] font-semibold tracking-[-0.01em] text-sw-ink">
                    {t.name}
                  </div>
                  <div className="mt-0.5 text-[12px] font-medium uppercase tracking-[0.08em] text-sw-muted">
                    {t.category}
                  </div>
                </div>
                <span className="translate-x-1 text-sw-muted opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
