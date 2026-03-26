import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const AuthPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("signin");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTab = (t) => {
    setTab(t);
    setForm({ name: "", email: "", password: "", confirm: "" });
    setShowPw(false);
    setShowCf(false);
    setError("");
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let res;
      if (tab === "signin") {
        res = await login(form.email, form.password);
      } else {
        if (form.password !== form.confirm) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        res = await register(form.name, form.email, form.password);
      }

      if (res.success) {
        navigate("/dashboard");
      } else {
        setError(res.message || "Authentication failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-[#f5f2ec] font-sans selection:bg-[#1a1612] selection:text-[#f5f2ec]">
      {/* Background Elements */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[70%] pointer-events-none z-0 bg-[radial-gradient(ellipse,_rgba(180,160,130,0.13)_0%,_transparent_70%)]" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[55%] h-[65%] pointer-events-none z-0 bg-[radial-gradient(ellipse,_rgba(120,100,80,0.09)_0%,_transparent_70%)]" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[repeating-linear-gradient(95deg,transparent,transparent_180px,rgba(160,140,110,0.055)_180px,rgba(160,140,110,0.055)_181px),repeating-linear-gradient(5deg,transparent,transparent_220px,rgba(160,140,110,0.035)_220px,rgba(160,140,110,0.035)_221px)]" />

      {/* Custom Styles for Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        @keyframes cc-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cc-panel-in {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes cc-spin {
          to { transform: rotate(360deg); }
        }
        .animate-fade-up { animation: cc-fade-up 0.55s cubic-bezier(.22,.8,.44,1) forwards; }
        .animate-panel-in { animation: cc-panel-in 0.28s cubic-bezier(.22,.8,.44,1) forwards; }
        .animate-spin-slow { animation: cc-spin 14s linear infinite; }
      `}</style>

      {/* Header */}
      <header className="relative z-10 px-4 pt-10 pb-5 text-center opacity-0 animate-fade-up [animation-delay:0.05s]">
        <h1 className="font-serif text-[clamp(30px,5vw,44px)] font-normal text-[#1a1612] tracking-[-0.015em] line-height-[1.1]">
          SyncWrite
        </h1>
        <p className="text-[10px] font-semibold tracking-[0.18em] text-[#a89880] mt-2 uppercase">
          Collaborative Documentation
        </p>
      </header>

      {/* Card */}
      <main className="relative z-10 flex-1 flex items-start justify-center px-4 pt-2 pb-10">
        <div className="w-full max-w-[360px] bg-[rgba(255,252,246,0.93)] border border-[rgba(180,160,130,0.18)] rounded-[18px] shadow-[0_2px_40px_rgba(100,80,50,0.08),0_1px_4px_rgba(100,80,50,0.05)] backdrop-blur-[10px] p-8 relative overflow-hidden opacity-0 animate-fade-up [animation-delay:0.12s]">
          {/* Corner Notch */}
          <div className="absolute top-0 right-0 w-[50px] h-[50px] bg-[#f5f2ec] [clip-path:polygon(0_0,100%_0,100%_100%)] border-l border-b border-[rgba(180,160,130,0.2)]" />

          {/* Tabs */}
          <div className="flex gap-6 border-b border-[rgba(180,160,130,0.18)] mb-7">
            <button
              className={`text-[15px] font-medium pb-[13px] relative transition-colors duration-200 tracking-[0.01em] ${tab === "signin" ? "text-[#1a1612] after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-[#1a1612] after:rounded-[2px]" : "text-[#b0a090] hover:text-[#5a4a38]"}`}
              onClick={() => handleTab("signin")}
              disabled={loading}
            >
              Sign In
            </button>
            <button
              className={`text-[15px] font-medium pb-[13px] relative transition-colors duration-200 tracking-[0.01em] ${tab === "signup" ? "text-[#1a1612] after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-[#1a1612] after:rounded-[2px]" : "text-[#b0a090] hover:text-[#5a4a38]"}`}
              onClick={() => handleTab("signup")}
              disabled={loading}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form key={tab} className="flex flex-col gap-[18px] animate-panel-in" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-[11px] font-medium px-3 py-2 rounded-md tracking-wide uppercase">
                {error}
              </div>
            )}

            {tab === "signup" && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold tracking-[0.12em] text-[#8a7a6a] uppercase">Full Name</label>
                <input
                  className="w-full bg-[rgba(245,242,236,0.7)] border border-[rgba(180,160,130,0.25)] rounded-lg py-[13px] px-4 text-sm text-[#1a1612] outline-none transition-all duration-200 focus:border-[#1a1612] focus:bg-white focus:shadow-[0_0_0_3px_rgba(26,22,18,0.06)] placeholder:text-[#c0b09e]"
                  type="text"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={set("name")}
                  required
                  disabled={loading}
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-semibold tracking-[0.12em] text-[#8a7a6a] uppercase">Email Address</label>
              <input
                className="w-full bg-[rgba(245,242,236,0.7)] border border-[rgba(180,160,130,0.25)] rounded-lg py-[13px] px-4 text-sm text-[#1a1612] outline-none transition-all duration-200 focus:border-[#1a1612] focus:bg-white focus:shadow-[0_0_0_3px_rgba(26,22,18,0.06)] placeholder:text-[#c0b09e]"
                type="email"
                placeholder="name@workspace.com"
                value={form.email}
                onChange={set("email")}
                required
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-semibold tracking-[0.12em] text-[#8a7a6a] uppercase">Password</label>
                {tab === "signin" && <a href="#" className="text-[10px] font-semibold tracking-[0.1em] text-[#4a6cf7] uppercase hover:opacity-65 transition-opacity">Forgot?</a>}
              </div>
              <div className="relative">
                <input
                  className="w-full bg-[rgba(245,242,236,0.7)] border border-[rgba(180,160,130,0.25)] rounded-lg py-[13px] px-4 pr-[46px] text-sm text-[#1a1612] outline-none transition-all duration-200 focus:border-[#1a1612] focus:bg-white focus:shadow-[0_0_0_3px_rgba(26,22,18,0.06)] placeholder:text-[#c0b09e]"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={set("password")}
                  required
                  disabled={loading}
                />
                <button
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b0a090] hover:text-[#1a1612] transition-colors p-0.5"
                  onClick={() => setShowPw(v => !v)}
                  type="button"
                  tabIndex={-1}
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            {tab === "signup" && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold tracking-[0.12em] text-[#8a7a6a] uppercase">Confirm Password</label>
                <div className="relative">
                  <input
                    className="w-full bg-[rgba(245,242,236,0.7)] border border-[rgba(180,160,130,0.25)] rounded-lg py-[13px] px-4 pr-[46px] text-sm text-[#1a1612] outline-none transition-all duration-200 focus:border-[#1a1612] focus:bg-white focus:shadow-[0_0_0_3px_rgba(26,22,18,0.06)] placeholder:text-[#c0b09e]"
                    type={showCf ? "text" : "password"}
                    placeholder="••••••••••"
                    value={form.confirm}
                    onChange={set("confirm")}
                    required
                    disabled={loading}
                  />
                  <button
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b0a090] hover:text-[#1a1612] transition-colors p-0.5"
                    onClick={() => setShowCf(v => !v)}
                    type="button"
                    tabIndex={-1}
                  >
                    <EyeIcon open={showCf} />
                  </button>
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className={`w-full bg-[#1a1612] text-[#f5f2ec] rounded-lg py-[15px] px-6 mt-1 text-sm font-medium tracking-[0.02em] flex items-center justify-center gap-[9px] transition-all duration-200 hover:bg-[#2d261e] hover:-translate-y-[1.5px] hover:shadow-[0_6px_20px_rgba(26,22,18,0.2)] active:translate-y-0 active:shadow-none ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? "Processing..." : (tab === "signin" ? "Continue to Workspace" : "Create Account")}
              {!loading && <ArrowRight />}
            </button>
          </form>
        </div>
      </main>

      {/* Legal */}
      <div className="relative z-10 text-xs text-[#a89880] text-center leading-[1.65] px-4 pb-5 opacity-0 animate-fade-up [animation-delay:0.22s]">
        By continuing, you agree to our <a href="#" className="text-[#6a5a48] underline underline-offset-2">Terms of Service</a> and <a href="#" className="text-[#6a5a48] underline underline-offset-2">Privacy Policy</a>.
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[rgba(180,160,130,0.15)] py-[18px] px-6 flex items-center justify-between flex-wrap gap-3 opacity-0 animate-fade-up [animation-delay:0.28s]">
        <span className="text-[10px] text-[#b0a090] tracking-[0.06em] uppercase">© 2024 SyncWrite. Built for Creators.</span>
        <nav className="flex gap-[22px]">
          {["Privacy", "Terms", "Contact", "Twitter"].map(l => (
            <a key={l} href="#" className="text-[10px] font-semibold tracking-[0.09em] uppercase text-[#a89880] hover:text-[#1a1612] transition-colors">{l}</a>
          ))}
        </nav>
      </footer>

      {/* New Feature Badge */}
      <svg className="fixed bottom-7 right-7 z-20 w-[76px] h-[76px] animate-spin-slow" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="38" cy="38" r="37" stroke="#c0b0a0" strokeWidth="1" strokeDasharray="4 3"/>
        <circle cx="38" cy="38" r="29" fill="rgba(255,252,246,0.95)" stroke="#d5c5b5" strokeWidth="0.75"/>
        <text
          fontFamily="sans-serif"
          fontSize="6.5"
          fontWeight="700"
          letterSpacing="1.5"
          fill="#4a6cf7"
          textAnchor="middle"
          dominantBaseline="middle"
          x="38"
          y="35"
        >NEW</text>
        <text
          fontFamily="sans-serif"
          fontSize="6"
          fontWeight="600"
          letterSpacing="1.2"
          fill="#8a7a6a"
          textAnchor="middle"
          dominantBaseline="middle"
          x="38"
          y="44"
        >FEATURE</text>
      </svg>
    </div>
  );
};

export default AuthPage;