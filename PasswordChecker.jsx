import { useState, useMemo, useEffect } from "react";

const DARK_MODE_STYLES = `
  :root {
    --c-purple: #534AB7; --c-purple-bg: #EEEDFE; --c-purple-border: #AFA9EC50;
    --c-teal:   #0F6E56; --c-teal-bg:   #E1F5EE; --c-teal-border:   #5DCAA550;
    --c-amber:  #854F0B; --c-amber-bg:  #FAEEDA; --c-amber-border:  #FAC77550;
    --c-coral:  #993C1D; --c-coral-bg:  #FAECE7; --c-coral-border:  #F0997B50;
    --c-red:    #A32D2D; --c-red-bg:    #FCEBEB; --c-red-border:    #F0959550;
    --c-green:  #3B6D11; --c-green-bg:  #EAF3DE; --c-green-border:  #97C45950;
    --c-bar-empty: #E1EFE8;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --c-purple: #AFA9EC; --c-purple-bg: #26215C; --c-purple-border: #7F77DD50;
      --c-teal:   #5DCAA5; --c-teal-bg:   #04342C; --c-teal-border:   #1D9E7550;
      --c-amber:  #FAC775; --c-amber-bg:  #412402; --c-amber-border:  #EF9F2750;
      --c-coral:  #F0997B; --c-coral-bg:  #4A1B0C; --c-coral-border:  #D85A3050;
      --c-red:    #F09595; --c-red-bg:    #501313; --c-red-border:    #E24B4A50;
      --c-green:  #97C459; --c-green-bg:  #173404; --c-green-border:  #63992250;
      --c-bar-empty: #1e3a2c;
    }
  }
`;

const COMMON_PATTERNS = [
  /^(password|passwd|pass|pwd)/i,
  /^(123456|12345|1234)/,
  /^(qwerty|azerty)/i,
  /^(admin|user|login|welcome|letmein)/i,
  /(.)\1{3,}/,
  /(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def)/i,
];

function generateStrongPassword() {
  const lower   = "abcdefghijklmnopqrstuvwxyz";
  const upper   = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nums    = "0123456789";
  const special = "!@#$%^&*";
  const all     = lower + upper + nums + special;
  const base = [
    lower[Math.floor(Math.random() * lower.length)],
    lower[Math.floor(Math.random() * lower.length)],
    upper[Math.floor(Math.random() * upper.length)],
    upper[Math.floor(Math.random() * upper.length)],
    nums[Math.floor(Math.random() * nums.length)],
    nums[Math.floor(Math.random() * nums.length)],
    special[Math.floor(Math.random() * special.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  const extras = Array.from({ length: 8 }, () => all[Math.floor(Math.random() * all.length)]);
  return [...base, ...extras].sort(() => Math.random() - 0.5).join("");
}

function analyzePassword(password) {
  if (!password) return null;

  const checks = {
    minLength:        { label: "At least 8 characters",    met: password.length >= 8 },
    goodLength:       { label: "12 or more characters",    met: password.length >= 12 },
    greatLength:      { label: "16 or more characters",    met: password.length >= 16 },
    hasUppercase:     { label: "Uppercase letter (A–Z)",   met: /[A-Z]/.test(password) },
    hasLowercase:     { label: "Lowercase letter (a–z)",   met: /[a-z]/.test(password) },
    hasNumber:        { label: "Number (0–9)",             met: /[0-9]/.test(password) },
    hasSpecial:       { label: "Special character (!@#…)", met: /[^A-Za-z0-9]/.test(password) },
    noCommonPatterns: { label: "No common patterns",       met: !COMMON_PATTERNS.some(p => p.test(password)) },
  };

  const score =
    (checks.minLength.met        ? 1 : 0) +
    (checks.goodLength.met       ? 1 : 0) +
    (checks.greatLength.met      ? 1 : 0) +
    (checks.hasUppercase.met     ? 1 : 0) +
    (checks.hasLowercase.met     ? 1 : 0) +
    (checks.hasNumber.met        ? 1 : 0) +
    (checks.hasSpecial.met       ? 2 : 0) +   // special chars count double
    (checks.noCommonPatterns.met ? 1 : 0);    // max = 9

  let pool = 0;
  if (checks.hasLowercase.met) pool += 26;
  if (checks.hasUppercase.met) pool += 26;
  if (checks.hasNumber.met)    pool += 10;
  if (checks.hasSpecial.met)   pool += 32;
  if (pool === 0) pool = 26;
  const entropy = Math.round(password.length * Math.log2(pool));

  const LEVELS = [
    { max: 1, label: "Very weak",   cssColor: "var(--c-red)",   cssBg: "var(--c-red-bg)",   cssBorder: "var(--c-red-border)",   segments: 1, tip: "This password would be cracked instantly. Please choose something much stronger." },
    { max: 3, label: "Weak",        cssColor: "var(--c-coral)", cssBg: "var(--c-coral-bg)", cssBorder: "var(--c-coral-border)", segments: 2, tip: "Too easy to guess. Add uppercase letters, numbers, and special characters." },
    { max: 5, label: "Fair",        cssColor: "var(--c-amber)", cssBg: "var(--c-amber-bg)", cssBorder: "var(--c-amber-border)", segments: 3, tip: "Getting better — mixing in special characters and more length will help significantly." },
    { max: 7, label: "Strong",      cssColor: "var(--c-green)", cssBg: "var(--c-green-bg)", cssBorder: "var(--c-green-border)", segments: 4, tip: "Solid password! Adding a few more characters or another special symbol would make it excellent." },
    { max: 9, label: "Very strong", cssColor: "var(--c-teal)",  cssBg: "var(--c-teal-bg)",  cssBorder: "var(--c-teal-border)",  segments: 5, tip: "Excellent! This password is highly secure and would take an extraordinary amount of time to crack." },
  ];

  const level = LEVELS.find(l => score <= l.max) ?? LEVELS[LEVELS.length - 1];
  return { score, checks, level, entropy };
}

const CHAR_TYPES = [
  { test: /[A-Z]/, color: "var(--c-purple)", bg: "var(--c-purple-bg)", border: "var(--c-purple-border)", label: "Uppercase" },
  { test: /[a-z]/, color: "var(--c-teal)",   bg: "var(--c-teal-bg)",   border: "var(--c-teal-border)",   label: "Lowercase" },
  { test: /[0-9]/, color: "var(--c-amber)",  bg: "var(--c-amber-bg)",  border: "var(--c-amber-border)",  label: "Number" },
];

function getCharStyle(char) {
  return CHAR_TYPES.find(t => t.test.test(char))
    ?? { color: "var(--c-coral)", bg: "var(--c-coral-bg)", border: "var(--c-coral-border)" };
}

export default function PasswordChecker() {
  const [password, setPassword] = useState("");
  const [visible,  setVisible]  = useState(false);
  const [copied,   setCopied]   = useState(false);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = DARK_MODE_STYLES;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  const analysis = useMemo(() => analyzePassword(password), [password]);
  const segments  = analysis?.level.segments  ?? 0;
  const lc        = analysis?.level.cssColor  ?? "var(--color-border-tertiary)";
  const lb        = analysis?.level.cssBg     ?? "transparent";
  const lbr       = analysis?.level.cssBorder ?? "var(--color-border-tertiary)";

  const handleGenerate = () => { setPassword(generateStrongPassword()); setVisible(true); };
  const handleCopy     = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: "1.5rem 0", maxWidth: "500px", margin: "0 auto" }}>
      <h2 className="sr-only">Password strength checker</h2>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "var(--border-radius-lg)",
          background: lb, border: `0.5px solid ${lc}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 0.875rem", transition: "background 0.35s, border-color 0.35s",
        }}>
          <i className="ti ti-shield-lock" aria-hidden="true"
             style={{ fontSize: "22px", color: analysis ? lc : "var(--color-text-tertiary)", transition: "color 0.35s" }} />
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: "500", color: "var(--color-text-primary)", margin: "0 0 0.25rem" }}>
          Password strength checker
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", margin: 0 }}>
          Real-time analysis — nothing leaves your device
        </p>
      </div>

      {/* ── Card ───────────────────────────────────────────────── */}
      <div style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)", padding: "1.25rem",
      }}>

        {/* Password input */}
        <div style={{ position: "relative", marginBottom: "0.75rem" }}>
          <input
            type={visible ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Type or paste a password…"
            aria-label="Password input"
            style={{ width: "100%", boxSizing: "border-box", fontFamily: "var(--font-mono)", fontSize: "15px", paddingRight: "42px" }}
          />
          <button
            onClick={() => setVisible(v => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                     background: "none", border: "none", cursor: "pointer", padding: "4px",
                     color: "var(--color-text-tertiary)", display: "flex", alignItems: "center" }}
          >
            <i className={`ti ${visible ? "ti-eye-off" : "ti-eye"}`} aria-hidden="true" style={{ fontSize: "17px" }} />
          </button>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <button onClick={handleGenerate} style={{ flex: 1, fontSize: "13px" }}>
            <i className="ti ti-refresh" aria-hidden="true" style={{ fontSize: "14px", verticalAlign: "-2px", marginRight: "5px" }} />
            Generate strong password
          </button>
          <button onClick={handleCopy} disabled={!password} style={{ fontSize: "13px", minWidth: "78px" }}>
            <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} aria-hidden="true"
               style={{ fontSize: "14px", verticalAlign: "-2px", marginRight: "5px" }} />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {/* ── Strength meter ─────────────────────────────────── */}
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", gap: "5px", marginBottom: "0.45rem" }}>
            {[1, 2, 3, 4, 5].map(seg => (
              <div key={seg} style={{
                flex: 1, height: "5px", borderRadius: "3px",
                background: segments >= seg ? lc : "var(--c-bar-empty)",
                transition: "background 0.35s ease",
              }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", fontWeight: "500", color: analysis ? lc : "var(--color-text-tertiary)", transition: "color 0.35s" }}>
              {analysis ? analysis.level.label : "Enter a password to begin"}
            </span>
            {analysis && (
              <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>
                ~{analysis.entropy} bits entropy
              </span>
            )}
          </div>
        </div>

        {/* ── Character map (signature element) ──────────────── */}
        {password.length > 0 && (
          <div style={{ marginBottom: "1.25rem" }}>
            <p style={{ fontSize: "11px", color: "var(--color-text-tertiary)", textTransform: "uppercase",
                         letterSpacing: "0.07em", margin: "0 0 0.5rem" }}>
              Character map
            </p>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: "3px", padding: "0.6rem",
              background: "var(--color-background-secondary)",
              borderRadius: "var(--border-radius-md)",
              border: "0.5px solid var(--color-border-tertiary)", minHeight: "34px",
            }}>
              {password.split("").map((ch, i) => {
                const { color, bg, border } = getCharStyle(ch);
                return (
                  <div key={i} title={`"${ch}"`} style={{
                    width: "21px", height: "21px", borderRadius: "3px",
                    background: bg, border: `0.5px solid ${border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "10px", color, fontFamily: "var(--font-mono)", fontWeight: "500",
                  }}>
                    {visible ? ch : "•"}
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div style={{ display: "flex", gap: "0.9rem", marginTop: "0.45rem", flexWrap: "wrap" }}>
              {[...CHAR_TYPES, { color: "var(--c-coral)", bg: "var(--c-coral-bg)", border: "var(--c-coral-border)", label: "Special" }]
                .map(({ color, bg, label }) => (
                  <span key={label} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--color-text-tertiary)" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: bg, border: `0.5px solid ${color}`, display: "inline-block" }} />
                    {label}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* ── Criteria checklist ─────────────────────────────── */}
        <div style={{ marginBottom: analysis ? "1rem" : 0 }}>
          <p style={{ fontSize: "11px", color: "var(--color-text-tertiary)", textTransform: "uppercase",
                       letterSpacing: "0.07em", margin: "0 0 0.6rem" }}>
            Security criteria
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.45rem" }}>
            {analysis
              ? Object.entries(analysis.checks).map(([key, { label, met }]) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                    <i
                      className={`ti ${met ? "ti-circle-check" : "ti-circle-x"}`}
                      aria-hidden="true"
                      style={{ fontSize: "16px", flexShrink: 0,
                               color: met ? "var(--c-green)" : "var(--c-red)" }}
                    />
                    <span style={{ fontSize: "12px", lineHeight: 1.3,
                                   color: met ? "var(--color-text-secondary)" : "var(--color-text-tertiary)" }}>
                      {label}
                    </span>
                  </div>
                ))
              : Array(8).fill(0).map((_, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%",
                                  background: "var(--color-background-secondary)", flexShrink: 0 }} />
                    <div style={{ height: "10px", background: "var(--color-background-secondary)",
                                  borderRadius: "4px", width: `${50 + (i % 3) * 18}%` }} />
                  </div>
                ))
            }
          </div>
        </div>

        {/* ── Contextual tip ─────────────────────────────────── */}
        {analysis && (
          <div style={{
            marginTop: "1rem", padding: "0.65rem 0.75rem",
            borderRadius: "var(--border-radius-md)",
            background: lb, border: `0.5px solid ${lbr}`,
            display: "flex", gap: "0.5rem", alignItems: "flex-start",
            transition: "background 0.35s, border-color 0.35s",
          }}>
            <i className="ti ti-info-circle" aria-hidden="true"
               style={{ fontSize: "16px", color: lc, flexShrink: 0, marginTop: "1px" }} />
            <p style={{ color: "var(--color-text-secondary)", fontSize: "13px", margin: 0, lineHeight: "1.55" }}>
              {analysis.level.tip}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <p style={{ textAlign: "center", fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "0.75rem" }}>
        All analysis is performed locally in your browser.
      </p>
    </div>
  );
}
