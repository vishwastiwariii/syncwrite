import React from "react";
import { useNavigate } from "react-router-dom";

/* ─── Integration glyphs ──────────────────────────────────────────────────
   Simple, brand-neutral marks rendered inside floating orbit bubbles.       */
const glyphs = {
  slack: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="10" y="2" width="4" height="10" rx="2" fill="#E01E5A" />
      <rect x="2" y="10" width="10" height="4" rx="2" fill="#36C5F0" />
      <rect x="12" y="12" width="4" height="10" rx="2" fill="#2EB67D" />
      <rect x="12" y="10" width="10" height="4" rx="2" fill="#ECB22E" />
    </svg>
  ),
  docs: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" fill="#4285F4" />
      <path d="M14 2v4h4" fill="#A1C2FA" />
      <path d="M8 12h8M8 15h8M8 18h5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  figma: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="15" cy="12" r="3.2" fill="#1ABCFE" />
      <path d="M8.8 2h3.2v6.4H8.8a3.2 3.2 0 1 1 0-6.4Z" fill="#F24E1E" />
      <path d="M12 8.4h3.2a3.2 3.2 0 1 1 0 6.4H12V8.4Z" fill="#FF7262" transform="translate(-3.2 0)" />
      <path d="M8.8 8.4H12v6.4H8.8a3.2 3.2 0 1 1 0-6.4Z" fill="#A259FF" />
      <path d="M8.8 14.8H12v3.2a3.2 3.2 0 1 1-3.2-3.2Z" fill="#0ACF83" />
    </svg>
  ),
  notion: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#fff" stroke="#17161d" strokeWidth="1.6" />
      <path d="M8 8v8M8 8l7 8M15 8v8" stroke="#17161d" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  github: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#17161d">
      <path d="M12 2C6.5 2 2 6.6 2 12.3c0 4.5 2.9 8.3 6.8 9.7.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.4-3.4-1.4-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .8.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5a10.3 10.3 0 0 0 6.8-9.7C22 6.6 17.5 2 12 2Z" />
    </svg>
  ),
  drive: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M9 3h6l6 10.5-3 5.5H6l-3-5.5L9 3Z" fill="#FFCF63" />
      <path d="M9 3l-6 10.5h6L15 3H9Z" fill="#4285F4" />
      <path d="M18 19l3-5.5h-6L12 19h6Z" fill="#0F9D58" />
    </svg>
  ),
};

/* Bubble positioned on an orbit ring. `angle` in degrees, `r` px radius.
   Outer transform places the bubble; the ring animates the rotation and the
   inner element counter-rotates so the icon stays upright.                  */
function OrbitBubble({ angle, r, spin, children }) {
  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{ transform: `rotate(${angle}deg) translate(${r}px) rotate(${-angle}deg)` }}
    >
      <div
        className="-translate-x-1/2 -translate-y-1/2 rounded-2xl border border-sw-line bg-sw-surface p-3 shadow-[0_10px_30px_rgba(23,22,29,0.1)]"
        style={{ animation: `sw-orbit-rev ${spin}s linear infinite` }}
      >
        {children}
      </div>
    </div>
  );
}

const Star = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f5a623">
    <path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7L12 2Z" />
  </svg>
);

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-24 sm:pt-24">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-24 -z-10 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(108,92,231,0.16),transparent_65%)]" />

      {/* ── Orbiting integrations (decorative, desktop only) ──
         Radii are pushed out toward the screen edges so the bubbles frame
         the headline rather than crowd it. Angles bias to the sides (0°=right,
         ±90°=top/bottom) to keep the top-center clear for the title.         */}
      <div className="pointer-events-none absolute left-1/2 top-[52%] hidden -translate-x-1/2 -translate-y-1/2 lg:block" aria-hidden="true">
        {/* rings */}
        <div className="absolute left-1/2 top-1/2 h-[940px] w-[940px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-sw-line" />
        <div className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-sw-line" />

        {/* outer ring bubbles */}
        <div className="absolute left-1/2 top-1/2 h-0 w-0" style={{ animation: "sw-orbit 60s linear infinite" }}>
          <OrbitBubble angle={-165} r={470} spin={60}>{glyphs.slack}</OrbitBubble>
          <OrbitBubble angle={-15} r={470} spin={60}>{glyphs.figma}</OrbitBubble>
          <OrbitBubble angle={135} r={470} spin={60}>{glyphs.github}</OrbitBubble>
        </div>

        {/* inner ring bubbles (reverse) */}
        <div className="absolute left-1/2 top-1/2 h-0 w-0" style={{ animation: "sw-orbit-rev 44s linear infinite" }}>
          <OrbitBubble angle={-125} r={310} spin={44}>{glyphs.docs}</OrbitBubble>
          <OrbitBubble angle={35} r={310} spin={44}>{glyphs.notion}</OrbitBubble>
          <OrbitBubble angle={160} r={310} spin={44}>{glyphs.drive}</OrbitBubble>
        </div>
      </div>

      {/* ── Center content ── */}
      <div className="relative mx-auto max-w-[720px] text-center">
        <span className="sw-anim sw-d1 inline-flex items-center gap-2 rounded-full border border-sw-line bg-sw-surface px-3 py-1.5 text-[12px] font-medium text-sw-muted shadow-[0_1px_6px_rgba(23,22,29,0.05)]">
          <span className="rounded-full bg-sw-violet px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            New
          </span>
          A place to think and write, together
        </span>

        <h1 className="sw-anim sw-d2 mt-7 font-serif text-[clamp(42px,8vw,76px)] leading-[1.03] tracking-[-0.02em]">
          Write together,
          <br />
          <em className="italic text-sw-violet">think</em> with AI.
        </h1>

        <p className="sw-anim sw-d3 mx-auto mt-6 max-w-[500px] text-[16px] leading-[1.7] text-sw-muted">
          SyncWrite is the collaborative editor where your team, your documents,
          and an AI that actually helps all live in one calm, fast workspace.
        </p>

        <div className="sw-anim sw-d4 mt-9 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate("/login?mode=signup")}
            className="rounded-full bg-sw-ink px-7 py-3.5 text-[15px] font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-black hover:shadow-[0_10px_26px_rgba(23,22,29,0.28)]"
          >
            Start writing — for free
          </button>
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 rounded-full border border-sw-line bg-sw-surface px-6 py-3.5 text-[15px] font-medium text-sw-ink transition-all duration-150 hover:-translate-y-px hover:bg-sw-violet-soft"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7L8 5Z" />
            </svg>
            See how it works
          </button>
        </div>

        {/* ── Social proof ── */}
        <div className="sw-anim sw-d5 mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <div className="flex -space-x-2.5">
            {["#6c5ce7", "#e01e5a", "#2eb67d", "#f5a623", "#4285f4"].map((c, i) => (
              <span
                key={i}
                className="h-8 w-8 rounded-full border-2 border-sw-bg"
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} />)}
              <span className="ml-1 text-[13px] font-semibold">4.9/5</span>
            </div>
            <p className="text-[13px] text-sw-muted">
              Loved by 40,000+ writers who draft with AI
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
