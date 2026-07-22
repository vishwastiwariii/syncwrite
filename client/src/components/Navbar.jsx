import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/* ─── Brand mark ──────────────────────────────────────────────────────────
   Small violet rounded-square logo with a stylized "sync" glyph.            */
function Logo() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-sw-violet shadow-[0_2px_10px_rgba(108,92,231,0.35)]">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8" />
        <path d="M20 4v4h-4" />
        <path d="M20 12a8 8 0 0 1-13.7 5.6L4 16" />
        <path d="M4 20v-4h4" />
      </svg>
    </span>
  );
}

const Chevron = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/* ─── Nav model ───────────────────────────────────────────────────────────
   `items` accept an optional `menu` array → renders a dropdown on hover.    */
const DEFAULT_ITEMS = [
  { label: "Features", href: "#features" },
  { label: "Templates", href: "#templates" },
  { label: "Pricing", href: "#pricing" },
  {
    label: "Resources",
    menu: [
      { label: "Documentation", href: "#docs" },
      { label: "Changelog", href: "#changelog" },
      { label: "Community", href: "#community" },
    ],
  },
];

function NavLink({ item }) {
  const [open, setOpen] = useState(false);
  const hasMenu = Array.isArray(item.menu) && item.menu.length > 0;

  if (!hasMenu) {
    return (
      <a
        href={item.href}
        className="rounded-full px-3.5 py-2 text-[14px] font-medium text-sw-muted transition-colors duration-150 hover:bg-sw-violet-soft hover:text-sw-ink"
      >
        {item.label}
      </a>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="flex items-center gap-1 rounded-full px-3.5 py-2 text-[14px] font-medium text-sw-muted transition-colors duration-150 hover:bg-sw-violet-soft hover:text-sw-ink"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {item.label}
        <Chevron />
      </button>

      {open && (
        <div className="absolute left-1/2 top-[calc(100%+8px)] w-52 -translate-x-1/2 rounded-2xl border border-sw-line bg-sw-surface p-1.5 shadow-[0_12px_40px_rgba(23,22,29,0.12)]">
          {item.menu.map((m) => (
            <a
              key={m.label}
              href={m.href}
              className="block rounded-xl px-3 py-2 text-[13.5px] font-medium text-sw-muted transition-colors duration-150 hover:bg-sw-violet-soft hover:text-sw-ink"
            >
              {m.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Navbar ───────────────────────────────────────────────────────────────
   Sticky pill container. Fully mountable: <Navbar /> works with no props.   */
export default function Navbar({ items = DEFAULT_ITEMS }) {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <nav className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 rounded-full border border-sw-line bg-[rgba(255,255,255,0.75)] py-2.5 pl-4 pr-2.5 shadow-[0_6px_28px_rgba(23,22,29,0.06)] backdrop-blur-xl">
        {/* Brand */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 pl-1"
        >
          <Logo />
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-sw-ink">
            SyncWrite
          </span>
        </button>

        {/* Center links (desktop) */}
        <div className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <NavLink key={item.label} item={item} />
          ))}
        </div>

        {/* Actions (desktop) — Dashboard when signed in, otherwise Login/Signup.
           While auth is still resolving, render nothing to avoid a flash of the
           wrong buttons. */}
        <div className="hidden items-center gap-1.5 md:flex">
          {loading ? null : isAuthenticated ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-full bg-sw-ink px-5 py-2.5 text-[14px] font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-black hover:shadow-[0_8px_22px_rgba(23,22,29,0.28)]"
            >
              Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="rounded-full px-4 py-2 text-[14px] font-medium text-sw-ink transition-colors duration-150 hover:bg-sw-violet-soft"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/login?mode=signup")}
                className="rounded-full bg-sw-ink px-5 py-2.5 text-[14px] font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-black hover:shadow-[0_8px_22px_rgba(23,22,29,0.28)]"
              >
                Start writing
              </button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-sw-ink transition-colors hover:bg-sw-violet-soft md:hidden"
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mx-auto mt-2 max-w-[1120px] rounded-3xl border border-sw-line bg-sw-surface p-3 shadow-[0_12px_40px_rgba(23,22,29,0.12)] md:hidden">
          {items.map((item) => (
            <a
              key={item.label}
              href={item.href || "#"}
              onClick={() => setMobileOpen(false)}
              className="block rounded-2xl px-4 py-3 text-[15px] font-medium text-sw-muted transition-colors hover:bg-sw-violet-soft hover:text-sw-ink"
            >
              {item.label}
            </a>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-sw-line pt-3">
            {loading ? null : isAuthenticated ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="rounded-full bg-sw-ink px-4 py-3 text-[15px] font-medium text-white transition-colors hover:bg-black"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="rounded-full px-4 py-3 text-[15px] font-medium text-sw-ink transition-colors hover:bg-sw-violet-soft"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/login?mode=signup")}
                  className="rounded-full bg-sw-ink px-4 py-3 text-[15px] font-medium text-white transition-colors hover:bg-black"
                >
                  Start writing
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
