import React, { useState, useRef, useEffect } from "react";
import { documentService } from "../services/document.service";

/* ─── Icons ───────────────────────────────────────────────────────────── */
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* ─── Styles ──────────────────────────────────────────────────────────── */
const STYLES = `
  @keyframes share-overlay-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes share-modal-in {
    from { opacity: 0; transform: translateY(24px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes share-toast-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .share-overlay {
    position: fixed; inset: 0; z-index: 100;
    background: rgba(0,0,0,0.35);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    animation: share-overlay-in 0.2s ease both;
  }
  .share-modal {
    width: 440px; max-width: 92vw;
    background: white;
    border-radius: 18px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08);
    animation: share-modal-in 0.28s cubic-bezier(.22,.8,.44,1) both;
    overflow: hidden;
    font-family: 'Sora', sans-serif;
  }
  .share-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px 16px;
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }
  .share-modal-header h3 {
    margin: 0; font-size: 16px; font-weight: 700;
    color: #111110; letter-spacing: -0.02em;
    display: flex; align-items: center; gap: 8px;
  }
  .share-modal-header h3 svg { color: #2a5cff; }
  .share-close-btn {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: none; border: none; cursor: pointer;
    color: #7a7975; transition: all 0.15s;
  }
  .share-close-btn:hover { background: #f4f4f2; color: #111110; }
  .share-modal-body { padding: 20px 24px 24px; }
  .share-field-label {
    font-size: 11px; font-weight: 600; color: #7a7975;
    text-transform: uppercase; letter-spacing: 0.06em;
    margin-bottom: 6px; display: block;
  }
  .share-input-row {
    display: flex; gap: 10px; margin-bottom: 16px;
  }
  .share-email-input {
    flex: 1; padding: 11px 14px;
    border: 1.5px solid rgba(0,0,0,0.1);
    border-radius: 10px; font-size: 13px;
    font-family: 'Sora', sans-serif;
    color: #111110; outline: none;
    transition: border 0.18s, box-shadow 0.18s;
    background: #fafaf9;
  }
  .share-email-input:focus {
    border-color: rgba(42,92,255,0.4);
    box-shadow: 0 0 0 3px rgba(42,92,255,0.08);
    background: white;
  }
  .share-email-input::placeholder { color: #b0afa8; }
  .share-role-select {
    position: relative; min-width: 120px;
  }
  .share-role-btn {
    width: 100%; padding: 11px 14px;
    border: 1.5px solid rgba(0,0,0,0.1);
    border-radius: 10px; font-size: 13px;
    font-family: 'Sora', sans-serif;
    color: #111110; background: #fafaf9;
    cursor: pointer; outline: none;
    display: flex; align-items: center; justify-content: space-between; gap: 6px;
    transition: border 0.18s, box-shadow 0.18s;
    font-weight: 500;
  }
  .share-role-btn:focus, .share-role-btn:hover {
    border-color: rgba(42,92,255,0.4);
    box-shadow: 0 0 0 3px rgba(42,92,255,0.08);
    background: white;
  }
  .share-role-dropdown {
    position: absolute; top: calc(100% + 4px); left: 0; right: 0;
    background: white; border-radius: 10px;
    border: 1px solid rgba(0,0,0,0.08);
    box-shadow: 0 8px 28px rgba(0,0,0,0.12);
    z-index: 10; overflow: hidden;
    animation: share-toast-in 0.15s ease both;
  }
  .share-role-option {
    padding: 10px 14px; font-size: 13px;
    font-family: 'Sora', sans-serif;
    cursor: pointer; display: flex; align-items: center; justify-content: space-between;
    transition: background 0.12s; color: #111110;
    border: none; background: none; width: 100%; text-align: left;
  }
  .share-role-option:hover { background: #f4f4f2; }
  .share-role-option .role-check { color: #2a5cff; }
  .share-role-desc {
    font-size: 10px; color: #7a7975; margin-top: 1px;
  }
  .share-submit-btn {
    width: 100%; padding: 12px;
    border: none; border-radius: 11px;
    font-size: 13px; font-weight: 600;
    font-family: 'Sora', sans-serif;
    cursor: pointer; letter-spacing: -0.01em;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.18s;
    background: #111110; color: white;
  }
  .share-submit-btn:hover:not(:disabled) {
    background: #222;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.18);
  }
  .share-submit-btn:disabled {
    opacity: 0.5; cursor: not-allowed;
  }
  .share-toast {
    margin-top: 14px; padding: 10px 14px;
    border-radius: 10px; font-size: 12px; font-weight: 500;
    display: flex; align-items: center; gap: 8px;
    animation: share-toast-in 0.2s ease both;
  }
  .share-toast.success {
    background: rgba(34,197,94,0.08); color: #16a34a;
    border: 1px solid rgba(34,197,94,0.15);
  }
  .share-toast.error {
    background: rgba(239,68,68,0.08); color: #dc2626;
    border: 1px solid rgba(239,68,68,0.15);
  }
`;

const ROLES = [
  { value: "VIEWER", label: "Viewer", desc: "Can view only" },
  { value: "EDITOR", label: "Editor", desc: "Can view & edit" },
];

/* ═══════════════════════════════════════════════════════════════════════ */
export default function ShareModal({ documentId, onClose }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }
  const emailRef = useRef(null);
  const roleRef = useRef(null);

  // Focus email input on mount
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Close role dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (roleRef.current && !roleRef.current.contains(e.target)) {
        setShowRoleDropdown(false);
      }
    }
    if (showRoleDropdown) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showRoleDropdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    setToast(null);
    try {
      await documentService.shareDocument(documentId, email.trim(), role);
      setToast({ type: "success", msg: `Shared with ${email.trim()} as ${role.toLowerCase()}` });
      setEmail("");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to share document";
      setToast({ type: "error", msg });
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find((r) => r.value === role);

  return (
    <>
      <style>{STYLES}</style>
      <div className="share-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="share-modal" onMouseDown={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="share-modal-header">
            <h3><ShareIcon /> Share Document</h3>
            <button className="share-close-btn" onClick={onClose}><CloseIcon /></button>
          </div>

          {/* Body */}
          <div className="share-modal-body">
            <form onSubmit={handleSubmit}>
              <label className="share-field-label">Invite collaborator</label>
              <div className="share-input-row">
                <input
                  ref={emailRef}
                  type="email"
                  className="share-email-input"
                  placeholder="Enter email address…"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="share-role-select" ref={roleRef}>
                  <button
                    type="button"
                    className="share-role-btn"
                    onClick={() => setShowRoleDropdown((v) => !v)}
                  >
                    {selectedRole?.label} <ChevronDown />
                  </button>
                  {showRoleDropdown && (
                    <div className="share-role-dropdown">
                      {ROLES.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          className="share-role-option"
                          onClick={() => { setRole(r.value); setShowRoleDropdown(false); }}
                        >
                          <div>
                            <div style={{ fontWeight: 500 }}>{r.label}</div>
                            <div className="share-role-desc">{r.desc}</div>
                          </div>
                          {role === r.value && <span className="role-check"><CheckIcon /></span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="submit"
                className="share-submit-btn"
                disabled={!email.trim() || loading}
              >
                {loading ? (
                  <>
                    <span style={{ display: 'inline-block', animation: 'ed-pulse 1.2s ease-in-out infinite' }}>⟳</span>
                    Sharing…
                  </>
                ) : (
                  <>
                    <ShareIcon /> Share
                  </>
                )}
              </button>
            </form>

            {/* Toast */}
            {toast && (
              <div className={`share-toast ${toast.type}`}>
                {toast.type === "success" ? <CheckIcon /> : "⚠"}
                {toast.msg}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
