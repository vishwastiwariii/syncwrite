import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/* ─── Icons ───────────────────────────────────────────────────────────── */
const DocIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);
const SharedIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const TemplatesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
  </svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

/* ─── Nav Items ───────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: "All Documents", icon: <DocIcon /> },
  { label: "Shared with me", icon: <SharedIcon /> },
  { label: "Templates", icon: <TemplatesIcon /> },
  { label: "Trash", icon: <TrashIcon /> },
];

/* ─── Sidebar Component ──────────────────────────────────────────────── */
export default function Sidebar({ activeNav, onNavChange, onCreateNew, creating }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-[210px] bg-white border-r border-[rgba(0,0,0,0.07)] flex flex-col py-6 px-4 fixed top-0 left-0 bottom-0 z-10">
      {/* Brand */}
      <div className="mb-7 px-1">
        <div
          className="text-[17px] font-bold text-[#111110] tracking-[-0.03em] leading-[1.1] cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          SyncWrite
        </div>
        <div className="text-[11px] text-[#7a7975] font-normal mt-[3px] tracking-[0.01em]">
          Collaborative Workspace
        </div>
      </div>

      {/* Create Button */}
      <button
        onClick={onCreateNew}
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
            onClick={() => onNavChange?.(item.label)}
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
          <UserIcon />
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
        <LogoutIcon />
        Logout
      </button>
    </aside>
  );
}
