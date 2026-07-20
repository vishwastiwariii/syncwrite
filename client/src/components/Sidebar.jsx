import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/* ─── Icons — Lucide monoline, matching the marketing pages ─────────────── */
const ico = (children) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const Icons = {
  documents: ico(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>),
  shared: ico(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>),
  templates: ico(<><rect x="3" y="3" width="18" height="7" rx="1" /><rect x="3" y="14" width="9" height="7" rx="1" /><rect x="16" y="14" width="5" height="7" rx="1" /></>),
  trash: ico(<><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></>),
  logout: ico(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>),
};

const NAV_ITEMS = [
  { label: "All Documents", icon: Icons.documents },
  { label: "Shared with me", icon: Icons.shared },
  { label: "Templates", icon: Icons.templates },
  { label: "Trash", icon: Icons.trash },
];

const initialsOf = (name) =>
  (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "?";

export default function Sidebar({ activeNav, onNavChange }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-10 flex w-[240px] flex-col border-r border-sw-line bg-[#fcfcfe] px-4 py-5">
      {/* Brand */}
      <button
        onClick={() => navigate("/")}
        className="mb-3.5 flex items-center gap-2.5 px-1.5 pb-3.5"
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-sw-violet">
          <span className="font-serif text-[16px] font-medium italic leading-none text-white">S</span>
        </span>
        <span className="font-serif text-[17px] font-medium text-sw-ink">SyncWrite</span>
      </button>

      {/* Nav */}
      <nav className="flex flex-col gap-1.5">
        {NAV_ITEMS.map((item) => {
          const active = item.label === activeNav;
          return (
            <button
              key={item.label}
              onClick={() => onNavChange?.(item.label)}
              className={`flex w-full items-center gap-[11px] rounded-[11px] px-[11px] py-[9px] text-left text-[14px] transition-colors duration-150 ${
                active
                  ? "bg-sw-violet-soft font-semibold text-sw-violet"
                  : "font-medium text-sw-muted hover:bg-sw-violet-2 hover:text-sw-ink"
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* User */}
      <div className="mt-4 border-t border-sw-line pt-3">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <span
            className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#ffd8a8,#f6a94b)" }}
          >
            {initialsOf(user?.name)}
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-sw-ink">
              {user?.name || "My Account"}
            </div>
            {user?.email && (
              <div className="truncate text-[11px] text-sw-faint">{user.email}</div>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-[11px] rounded-[11px] px-[11px] py-[9px] text-left text-[13.5px] font-medium text-sw-muted transition-colors duration-150 hover:bg-[#fdeaec] hover:text-[#b42318]"
        >
          {Icons.logout}
          Logout
        </button>
      </div>
    </aside>
  );
}
