import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* ─── Scroll reveal hook ──────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("hp-visible");
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── Icons ───────────────────────────────────────────────────────────── */
const Bell = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const User = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ImgIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const ArrowRight = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const DocLines = () => (
  <svg width="22" height="28" viewBox="0 0 22 28" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" strokeLinecap="round">
    <rect x="2" y="2" width="18" height="24" rx="2.5" />
    <line x1="6" y1="9" x2="16" y2="9" />
    <line x1="6" y1="13" x2="16" y2="13" />
    <line x1="6" y1="17" x2="13" y2="17" />
  </svg>
);

const TemplateLines = () => (
  <svg width="30" height="38" viewBox="0 0 30 38" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1.4" strokeLinecap="round">
    <rect x="2" y="2" width="26" height="34" rx="3" />
    <line x1="7" y1="11" x2="23" y2="11" />
    <line x1="7" y1="16" x2="23" y2="16" />
    <line x1="7" y1="21" x2="18" y2="21" />
  </svg>
);

/* ─── Feature card ────────────────────────────────────────────────────── */
function FeatCard({ num, title, desc, dark, link, visual, delay }) {
  const ref = useReveal();
  const delayClass =
    delay === 1 ? "hp-d1" : delay === 2 ? "hp-d2" : delay === 3 ? "hp-d3" : "hp-d4";

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-[14px] border p-[26px_22px_22px] cursor-default transition-all duration-[220ms] hover:-translate-y-[3px] hover:shadow-[0_10px_32px_rgba(0,0,0,0.09)] hp-reveal ${delayClass} ${
        dark
          ? "bg-[#0d0d0d] border-transparent text-white"
          : "bg-white border-[rgba(0,0,0,0.08)]"
      }`}
    >
      <div
        className={`font-serif text-[21px] italic mb-[14px] ${
          dark ? "text-[#ff6b6b]" : "text-[#3b5bdb]"
        }`}
      >
        {num}
      </div>
      <div className="text-[16px] font-semibold tracking-[-0.01em] leading-[1.25] mb-[10px]">
        {title}
      </div>
      <p className={`text-[13px] leading-[1.68] ${dark ? "text-[#9a9490]" : "text-[#6b6560]"}`}>
        {desc}
      </p>
      {link && (
        <a
          href="#"
          className="inline-flex items-center gap-[6px] text-[10px] font-bold tracking-[0.1em] uppercase text-[#3b5bdb] no-underline mt-[18px] transition-[gap] duration-[180ms] hover:gap-[11px]"
        >
          Explore Features <ArrowRight />
        </a>
      )}
      {visual}
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const secH2Ref = useReveal();
  const featRef = useReveal();
  const ctaRef = useReveal();

  return (
    <div className="font-sans bg-[#f5f2ec] min-h-screen overflow-x-hidden text-[#0d0d0d]">
      {/* ── Fonts & Animations ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');

        .font-serif { font-family: 'DM Serif Display', serif; }
        .font-sans  { font-family: 'DM Sans', sans-serif; }

        @keyframes hp-fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hp-anim-1 { opacity: 0; animation: hp-fadeUp 0.5s cubic-bezier(.22,.8,.44,1) 0.05s forwards; }
        .hp-anim-2 { opacity: 0; animation: hp-fadeUp 0.55s cubic-bezier(.22,.8,.44,1) 0.13s forwards; }
        .hp-anim-3 { opacity: 0; animation: hp-fadeUp 0.5s cubic-bezier(.22,.8,.44,1) 0.22s forwards; }
        .hp-anim-4 { opacity: 0; animation: hp-fadeUp 0.5s cubic-bezier(.22,.8,.44,1) 0.3s forwards; }
        .hp-anim-5 { opacity: 0; animation: hp-fadeUp 0.6s cubic-bezier(.22,.8,.44,1) 0.38s forwards; }

        .hp-reveal {
          opacity: 0; transform: translateY(22px);
          transition: opacity 0.55s cubic-bezier(.22,.8,.44,1), transform 0.55s cubic-bezier(.22,.8,.44,1);
        }
        .hp-reveal.hp-visible { opacity: 1; transform: translateY(0); }
        .hp-d1 { transition-delay: 0.05s; }
        .hp-d2 { transition-delay: 0.14s; }
        .hp-d3 { transition-delay: 0.22s; }
        .hp-d4 { transition-delay: 0.30s; }
      `}</style>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-[100] bg-[rgba(245,242,236,0.92)] backdrop-blur-[16px] border-b border-[rgba(0,0,0,0.08)] flex items-center justify-between px-8 md:px-12 h-16">
        <span
          className="font-serif text-[22px] md:text-[26px] font-normal text-[#0d0d0d] tracking-[-0.02em] cursor-pointer select-none"
          onClick={() => navigate("/")}
        >
          SyncWrite
        </span>

        <div className="relative flex items-center">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="w-10 h-10 rounded-full bg-[#3b5bdb] text-white border-none cursor-pointer flex items-center justify-center transition-all duration-150 hover:opacity-90"
              >
                <User />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-[48px] bg-white border border-[rgba(0,0,0,0.1)] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] py-2 min-w-[160px] z-50">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      navigate("/login");
                    }}
                    className="w-full text-left px-5 py-[10px] text-[14px] font-medium text-[#0d0d0d] bg-transparent border-none cursor-pointer transition-colors duration-150 hover:bg-[rgba(0,0,0,0.04)]"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-[#0d0d0d] text-white border-none rounded-[10px] px-6 py-[10px] font-sans text-[14px] font-medium cursor-pointer tracking-[0.01em] transition-all duration-[180ms] hover:bg-[#222] hover:-translate-y-[1px] hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-[1100px] mx-auto px-6 pt-[68px] pb-[44px] text-center">
        {/* Badge */}
        <div className="hp-anim-1 inline-flex items-center gap-2 bg-white border border-[rgba(0,0,0,0.08)] rounded-full py-[5px] pl-[10px] pr-[14px] text-[11px] font-semibold tracking-[0.08em] text-[#5a5560] uppercase mb-7 shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
          <div className="flex gap-1">
            <span className="w-[7px] h-[7px] rounded-full bg-[#ff6b6b]" />
            <span className="w-[7px] h-[7px] rounded-full bg-[#ffd43b]" />
            <span className="w-[7px] h-[7px] rounded-full bg-[#69db7c]" />
          </div>
          <span className="bg-[#3b5bdb] text-white rounded-[4px] px-[7px] py-[2px] text-[10px] font-bold tracking-[0.06em]">
            NEW
          </span>
          Real-Time Collaboration Suite
        </div>

        {/* Heading */}
        <h1 className="hp-anim-2 font-serif text-[clamp(42px,8vw,76px)] font-normal leading-[1.08] tracking-[-0.025em] text-[#0d0d0d] mb-[22px]">
          The blank page's
          <br />
          new <em className="italic text-[#3b5bdb]">best friend.</em>
        </h1>

        {/* Subtitle */}
        <p className="hp-anim-3 text-[15px] text-[#6b6560] leading-[1.72] max-w-[520px] mx-auto mb-9 font-normal">
          Designed for students, freelancers, and writers. A beautiful space for
          your notes, drafts, and collaboration—without the complexity of
          traditional tools.
        </p>

        {/* CTAs */}
        <div className="hp-anim-4 flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => navigate("/login")}
            className="bg-[#0d0d0d] text-white border-none rounded-lg px-[26px] py-[13px] font-sans text-[14px] font-medium cursor-pointer tracking-[0.01em] transition-all duration-[180ms] hover:bg-[#1a1a1a] hover:-translate-y-[1.5px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
          >
            Start writing — for free
          </button>
          <button
            onClick={() => navigate("/templates")}
            className="bg-transparent text-[#0d0d0d] border-[1.5px] border-[rgba(0,0,0,0.16)] rounded-lg px-[22px] py-[12px] font-sans text-[14px] font-medium cursor-pointer tracking-[0.01em] transition-all duration-[180ms] hover:border-[rgba(0,0,0,0.35)] hover:bg-[rgba(0,0,0,0.025)] hover:-translate-y-[1px]"
          >
            View Showcase
          </button>
        </div>
      </section>

      {/* ── MOCKUP ── */}
      <div className="hp-anim-5 px-4 max-w-[1060px] mx-auto">
        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] shadow-[0_8px_48px_rgba(0,0,0,0.09),0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Browser bar */}
          <div className="bg-[#f8f6f1] border-b border-[rgba(0,0,0,0.08)] px-[18px] py-[10px] flex items-center gap-[14px]">
            <div className="flex gap-[5px]">
              <span className="w-[10px] h-[10px] rounded-full bg-[#ff5f57]" />
              <span className="w-[10px] h-[10px] rounded-full bg-[#febc2e]" />
              <span className="w-[10px] h-[10px] rounded-full bg-[#28c840]" />
            </div>
            <span className="text-[11px] text-[#9a9490] tracking-[0.03em]">
              novel_draft_chapter_1.canvas
            </span>
          </div>

          {/* Body */}
          <div className="p-[24px_20px_28px] min-h-[250px] flex gap-4">
            <div className="flex-1 flex flex-col gap-[13px]">
              <div className="h-[30px] bg-[#f0ede7] rounded-[6px] w-[62%]" />
              <div className="h-[18px] bg-[#e8e4dc] rounded-[4px] w-[42%]" />
              <div className="inline-block bg-[#3b5bdb] text-white text-[9px] font-bold tracking-[0.1em] px-[7px] py-[3px] rounded-[3px] w-fit">
                TOC
              </div>
              <div className="w-[175px] h-[112px] bg-gradient-to-br from-[#ede9e0] to-[#ddd9d0] rounded-lg border border-[rgba(0,0,0,0.08)] flex items-center justify-center">
                <ImgIcon />
              </div>
            </div>
            <div className="w-[42px] flex flex-col items-center gap-2 pt-[2px]">
              <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 bg-[#3b5bdb]">
                Y
              </div>
              <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 bg-[#cc5de8]">
                M
              </div>
              <div className="text-[10px] font-semibold text-[#8a8480] bg-[#f0ede7] rounded-[4px] px-[5px] py-[2px]">
                +4
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="bg-[#eeebe4] px-6 pt-20 pb-[88px] mt-14">
        <div className="max-w-[1100px] mx-auto">
          <h2
            ref={secH2Ref}
            className="hp-reveal font-serif text-[clamp(26px,4vw,38px)] font-normal leading-[1.18] tracking-[-0.02em] text-[#0d0d0d] mb-11 max-w-[400px]"
          >
            Everything you need to
            <br />
            capture your next big idea.
          </h2>

          <div ref={featRef} className="hp-reveal grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
            <FeatCard
              num="01."
              title="The Universal Schema"
              desc="Every piece of writing is stored as clean JSON. No proprietary lock-in. Export to Markdown, PDF, or directly to your favorite publishing platform."
              delay={1}
              visual={
                <div className="flex justify-end mt-[18px]">
                  <div className="w-24 h-[76px] bg-[#e8e4dc] rounded-lg flex items-center justify-center opacity-70">
                    <ImgIcon />
                  </div>
                </div>
              }
            />
            <FeatCard
              num="02."
              title="Focused Flow"
              dark
              desc="Minimize distractions. Built-in focus modes and seamless collaboration keep your creative momentum going without interruption."
              delay={2}
              visual={
                <div className="mt-5">
                  <div className="flex">
                    <div className="w-[34px] h-[34px] rounded-full bg-[#ff6b6b]" />
                    <div className="w-[34px] h-[34px] rounded-full bg-[#cc5de8] -ml-[10px]" />
                  </div>
                </div>
              }
            />
            <FeatCard
              num="03."
              title="Infinite History"
              desc="Never lose a word. Revert any edit and see exactly how your draft evolved over time with simple, visual history."
              link
              delay={3}
            />
            <FeatCard
              num="04."
              title="100+ Ready-Made Templates"
              desc="Jumpstart your next project with professionally designed layouts for essays, business proposals, film scripts, and blog posts."
              delay={4}
              visual={
                <div className="flex justify-end mt-[14px]">
                  <TemplateLines />
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="px-6 py-[100px] text-center">
        <div ref={ctaRef} className="hp-reveal">
          <h2 className="font-serif text-[clamp(30px,6vw,56px)] font-normal leading-[1.1] tracking-[-0.025em] max-w-[600px] mx-auto mb-8">
            Ready to draft your next masterpiece?
          </h2>
          <button
            onClick={() => navigate("/login")}
            className="bg-[#0d0d0d] text-white border-none rounded-lg px-[34px] py-[15px] font-sans text-[15px] font-medium cursor-pointer tracking-[0.01em] transition-all duration-[180ms] hover:bg-[#1a1a1a] hover:-translate-y-[1.5px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
          >
            Start writing now
          </button>
          <p className="text-[11px] text-[#6b6560] tracking-[0.07em] uppercase font-medium mt-[14px]">
            No credit card required
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[rgba(0,0,0,0.08)] px-7 py-[18px] flex items-center justify-between flex-wrap gap-3">
        <span className="text-[10px] text-[#a09890] tracking-[0.06em] uppercase">
          © 2024 SyncWrite. Built for Creators.
        </span>
        <ul className="flex gap-[22px] list-none">
          {["Privacy", "Terms", "Contact", "Instagram"].map((l) => (
            <li key={l}>
              <a
                href="#"
                className="text-[10px] font-semibold tracking-[0.09em] uppercase text-[#a09890] no-underline transition-colors duration-150 hover:text-[#0d0d0d]"
              >
                {l}
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}