import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/* ─── Icons ───────────────────────────────────────────────────────────────── */
const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.86c2.26-2.09 3.56-5.17 3.56-8.87z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.7 0 3.99 2.47 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
  </svg>
);

/* ─── Brand mark ──────────────────────────────────────────────────────────── */
function Logo({ light = false }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5">
      <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-sw-violet">
        <span className="font-serif text-[17px] font-medium italic leading-none text-white">S</span>
      </span>
      <span className={`font-serif text-[19px] font-medium ${light ? "text-white" : "text-sw-ink"}`}>
        SyncWrite
      </span>
    </Link>
  );
}

/* ─── Form primitives ─────────────────────────────────────────────────────── */
function Field({ children }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-sw-line px-3.5 py-3 transition-colors focus-within:border-sw-violet">
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-transparent text-[14px] text-sw-ink outline-none placeholder:text-sw-faint disabled:opacity-60";

function PasswordField({ value, onChange, disabled, placeholder = "Password", autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <Field>
      <input
        type={show ? "text" : "password"}
        className={inputCls}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required
        disabled={disabled}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((v) => !v)}
        className="ml-2 shrink-0 text-sw-faint transition-colors hover:text-sw-ink"
        aria-label={show ? "Hide password" : "Show password"}
      >
        <EyeIcon open={show} />
      </button>
    </Field>
  );
}

/* Google OAuth is not wired to the backend yet — shown but disabled. */
function GoogleButton({ label }) {
  return (
    <button
      type="button"
      disabled
      title="Google sign-in coming soon"
      className="flex w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-xl border border-sw-line py-3 text-[14px] font-semibold text-sw-muted opacity-70"
    >
      <GoogleIcon /> {label}
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 text-[12px] text-sw-faint">
      <div className="h-px flex-1 bg-sw-line" />
      or
      <div className="h-px flex-1 bg-sw-line" />
    </div>
  );
}

/* ─── Visual panels — full-height, full-bleed ─────────────────────────────── */
function SignupVisual() {
  return (
    <div className="relative hidden flex-col justify-center overflow-hidden bg-[linear-gradient(160deg,#EDEBFF,#F4F2FF)] px-12 py-16 md:flex lg:px-16">
      <div className="absolute -right-24 -top-24 h-[380px] w-[380px] rounded-full border border-[#d9d2ff]" />
      <div className="absolute -left-20 bottom-8 h-[260px] w-[260px] rounded-full border border-[#d9d2ff]" />
      <div className="absolute right-10 bottom-24 h-[150px] w-[150px] rounded-full border border-[#e2ddff]" />
      <div className="relative max-w-[420px]">
        <div className="font-serif text-[clamp(28px,3.2vw,40px)] font-medium leading-[1.15] text-[#3a3550]">
          Join 40,000+ writers who draft with AI.
        </div>
        <div className="mt-8 rounded-2xl bg-white p-5 shadow-[0_24px_48px_-28px_rgba(108,92,231,0.6)]">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sw-violet-soft text-[15px] text-sw-violet">
              ✦
            </span>
            <p className="text-[14px] leading-[1.5] text-sw-muted">
              “It's like having an editor who never sleeps.”
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginVisual() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-[#17161C] px-12 py-12 md:flex lg:px-16">
      <div className="absolute -bottom-32 -left-32 h-[460px] w-[460px] rounded-full border border-[#2e2c38]" />
      <div className="absolute -top-20 -right-10 h-[240px] w-[240px] rounded-full border border-[#26242f]" />
      <Logo light />
      <div className="relative max-w-[420px]">
        <div className="font-serif text-[clamp(30px,3.4vw,44px)] font-medium leading-[1.15] text-white">
          Welcome back.
        </div>
        <p className="mt-4 text-[15px] leading-[1.6] text-[#9b99a6]">
          Your drafts, collaborators, and AI are right where you left them.
        </p>
      </div>
      <div className="relative text-[13px] text-[#6f6d78]">
        © 2026 SyncWrite. All rights reserved.
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
const EMPTY = { name: "", email: "", password: "", confirm: "" };

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const mode = params.get("mode") === "signup" ? "signup" : "login";
  const isSignup = mode === "signup";

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(true);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const switchMode = (next) => {
    setParams(next === "signup" ? { mode: "signup" } : {}, { replace: true });
    setForm(EMPTY);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignup && form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = isSignup
        ? await register(form.name, form.email, form.password)
        : await login(form.email, form.password);

      if (res.success) navigate("/dashboard");
      else setError(res.message || "Authentication failed");
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  /* ── Form side — fills its half, content capped for readability ── */
  const formPanel = (
    <div className="flex items-center justify-center bg-sw-surface px-6 py-12 sm:px-10">
      <div className="w-full max-w-[400px]">
        {/* Logo: always on the signup side; on login it lives in the dark
            panel, so only show it here when that panel is hidden (mobile). */}
        <div className={`mb-8 ${isSignup ? "" : "md:hidden"}`}>
          <Logo />
        </div>

        <h1 className="font-serif text-[clamp(30px,3vw,36px)] font-medium tracking-[-0.01em]">
          {isSignup ? "Create your account" : "Log in"}
        </h1>
        <p className="mt-2 mb-6 text-[14.5px] text-sw-muted">
          {isSignup ? "Start writing free — no card required." : "Good to see you again."}
        </p>

        {isSignup && (
          <>
            <GoogleButton label="Sign up with Google" />
            <div className="my-4">
              <Divider />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-[#f5c2c7] bg-[#fdeaec] px-3.5 py-2.5 text-[13px] font-medium text-[#b42318]"
            >
              {error}
            </div>
          )}

          {isSignup && (
            <Field>
              <input
                type="text"
                className={inputCls}
                placeholder="Full name"
                value={form.name}
                onChange={set("name")}
                autoComplete="name"
                required
                disabled={loading}
              />
            </Field>
          )}

          <Field>
            <input
              type="email"
              className={inputCls}
              placeholder="Email address"
              value={form.email}
              onChange={set("email")}
              autoComplete="email"
              required
              disabled={loading}
            />
          </Field>

          <PasswordField
            value={form.password}
            onChange={set("password")}
            disabled={loading}
            autoComplete={isSignup ? "new-password" : "current-password"}
          />

          {isSignup && (
            <PasswordField
              value={form.confirm}
              onChange={set("confirm")}
              disabled={loading}
              placeholder="Confirm password"
              autoComplete="new-password"
            />
          )}

          {!isSignup && (
            <div className="my-1 flex items-center justify-between text-[13px]">
              <label className="flex cursor-pointer items-center gap-2 text-sw-muted">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#6C5CE7]"
                />
                Remember me
              </label>
              <span className="font-semibold text-sw-faint" title="Password reset coming soon">
                Forgot password?
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-sw-ink py-3.5 text-[15px] font-semibold text-white transition-all duration-150 hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading
              ? isSignup
                ? "Creating account…"
                : "Logging in…"
              : isSignup
                ? "Create account"
                : "Log in"}
          </button>
        </form>

        {!isSignup && (
          <>
            <div className="my-4">
              <Divider />
            </div>
            <GoogleButton label="Continue with Google" />
          </>
        )}

        <p className="mt-6 text-center text-[13.5px] text-sw-muted">
          {isSignup ? "Already have an account? " : "New here? "}
          <button
            type="button"
            onClick={() => switchMode(isSignup ? "login" : "signup")}
            className="font-semibold text-sw-violet hover:text-sw-violet-strong"
          >
            {isSignup ? "Log in" : "Create an account"}
          </button>
        </p>

        {isSignup && (
          <p className="mt-4 text-center text-[11.5px] leading-[1.6] text-sw-faint">
            By creating an account you agree to our Terms of Service and Privacy
            Policy.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`grid min-h-screen bg-sw-surface ${
        isSignup ? "md:grid-cols-[1.05fr_0.95fr]" : "md:grid-cols-[0.95fr_1.05fr]"
      }`}
    >
      {isSignup ? (
        <>
          {formPanel}
          <SignupVisual />
        </>
      ) : (
        <>
          <LoginVisual />
          {formPanel}
        </>
      )}
    </div>
  );
}
