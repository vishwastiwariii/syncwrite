import React, { useState } from "react";
import { href, useNavigate } from "react-router-dom";

/* ─── Brand mark (light, for the dark footer) ────────────────────────────── */
function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-sw-violet">
        <span className="font-serif text-[17px] font-medium italic leading-none text-white">S</span>
      </span>
      <span className="font-serif text-[19px] font-medium text-white">SyncWrite</span>
    </div>
  );
}

/* ─── Sitemap columns (verbatim from the design system) ──────────────────── */
const COLUMNS = [
  
];

/* ─── Social icons ───────────────────────────────────────────────────────── */
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.9 2H22l-7.3 8.35L23.3 22h-6.7l-5.24-6.86L5.36 22H2.25l7.8-8.93L1 2h6.87l4.74 6.27L18.9 2Zm-1.18 18h1.72L7.36 3.9H5.5L17.72 20Z" />
  </svg>
);
const InIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.64h.05c.53-1 1.83-2.05 3.77-2.05C20.7 8.59 22 10.28 22 13.4V21h-4v-6.75c0-1.61-.03-3.68-2.24-3.68-2.24 0-2.58 1.75-2.58 3.56V21H9V9Z" />
  </svg>
);
const GhIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.5 2 2 6.6 2 12.3c0 4.5 2.9 8.3 6.8 9.7.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.4-3.4-1.4-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .8.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5a10.3 10.3 0 0 0 6.8-9.7C22 6.6 17.5 2 12 2Z" />
  </svg>
);
const SOCIALS = [{ Icon: XIcon, label: "X", href:"https://x.com/vishwasdev_"}, { Icon: InIcon, label: "LinkedIn", href: "https://www.linkedin.com/in/vishwastiwarii/" }, { Icon: GhIcon, label: "GitHub", href:"https://github.com/vishwastiwariii/syncwrite" }];

/* ─── Footer ─────────────────────────────────────────────────────────────── */
export default function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-sw-ink">
      <div className="mx-auto max-w-[1240px]">
        {/* ── CTA band ── */}
        <div className="relative overflow-hidden border-b border-[#26242f] px-6 pb-[46px] pt-[60px] text-center sm:px-11">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[60%] h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#26242f]"
          />
          <div className="relative">
            <h2 className="font-serif text-[clamp(32px,4.5vw,50px)] font-medium leading-[1.05] tracking-[-0.02em] text-white">
              Your best writing starts here.
            </h2>
            <p className="mx-auto mt-3.5 max-w-[460px] text-[16px] text-[#9b99a6]">
              Join creators, students, and teams writing better together with
              SyncWrite.
            </p>
            <div className="mt-[26px] flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate("/login?mode=signup")}
                className="rounded-full bg-white px-[26px] py-3.5 text-[15px] font-semibold text-sw-ink transition-transform duration-150 hover:-translate-y-px"
              >
                Start writing free
              </button>
              <button
                onClick={() => navigate("/login")}
                className="rounded-full border border-[#3a3844] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-white/5"
              >
                Book a demo
              </button>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#26242f] px-6 py-5 sm:px-11">
          <span className="text-[13px] text-[#6f6d78]">
            © 2026 SyncWrite. All rights reserved.
          </span>
          <div className="flex gap-2.5">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                aria-label={s.label}
                className="grid h-[34px] w-[34px] place-items-center rounded-full border border-[#34323d] text-[#9b99a6] transition-colors duration-150 hover:border-[#4a4854] hover:text-white"
              >
                <s.Icon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
