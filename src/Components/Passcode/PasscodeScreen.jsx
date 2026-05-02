import React, { useState, useRef, useEffect } from "react";

const PasscodeScreen = ({ mode, walletAddress, onSuccess, onError }) => {
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [confirmDigits, setConfirmDigits] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("enter");
  const hiddenRef = useRef(null);

  const currentDigits = step === "confirm" ? confirmDigits : digits;
  const setCurrentDigits = step === "confirm" ? setConfirmDigits : setDigits;

  useEffect(() => {
    setTimeout(() => hiddenRef.current?.focus(), 100);
  }, [step]);

  const focusInput = () => hiddenRef.current?.focus();

  const handleInput = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 6);
    const arr = raw.split("");
    while (arr.length < 6) arr.push("");
    setCurrentDigits(arr);
    setError("");
    if (raw.length === 6) setTimeout(() => handleSubmit(arr), 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Backspace") {
      const cur = currentDigits.join("");
      if (!cur.length) return;
      const next = cur.slice(0, -1).split("");
      while (next.length < 6) next.push("");
      setCurrentDigits(next);
      setError("");
      e.target.value = cur.slice(0, -1);
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!p) return;
    const arr = p.split("");
    while (arr.length < 6) arr.push("");
    setCurrentDigits(arr);
    setError("");
    if (p.length === 6) setTimeout(() => handleSubmit(arr), 100);
  };

  const handleSubmit = async (digitArr) => {
    const arr = digitArr || currentDigits;
    const code = arr.join("");
    if (code.length !== 6) return;

    if (mode === "set") {
      if (step === "enter") {
        setStep("confirm");
        setConfirmDigits(Array(6).fill(""));
        if (hiddenRef.current) hiddenRef.current.value = "";
        setTimeout(() => hiddenRef.current?.focus(), 100);
        return;
      }
      if (digits.join("") !== code) {
        setError("Passcodes do not match. Try again.");
        setDigits(Array(6).fill(""));
        setConfirmDigits(Array(6).fill(""));
        setStep("enter");
        if (hiddenRef.current) hiddenRef.current.value = "";
        setTimeout(() => hiddenRef.current?.focus(), 100);
        return;
      }
      try {
        setLoading(true);
        const { setPasscode } = await import("../../api/auth.api");
        const res = await setPasscode({
          user_wallet: walletAddress,
          passcode: digits.join(""),
        });
        onSuccess(res.data.user || null);
      } catch (err) {
        const msg = err?.response?.data?.error || "";
        if (msg === "Passcode already set") {
          setError("Passcode already exists. Please verify instead.");
          setTimeout(() => onError("switch_to_verify"), 1500);
          return;
        }
        setError(msg || "Failed to set passcode");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      const { verifyPasscode } = await import("../../api/auth.api");
      const res = await verifyPasscode({
        user_wallet: walletAddress,
        passcode: code,
      });
      onSuccess(res.data.user);
    } catch {
      setError("Incorrect passcode. Try again.");
      setDigits(Array(6).fill(""));
      if (hiddenRef.current) hiddenRef.current.value = "";
      setTimeout(() => hiddenRef.current?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  const filledCount = currentDigits.filter((d) => d !== "").length;

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-8"
      onClick={(e) => {
        if (e.target.closest("[data-chat-button]")) return;
        focusInput();
      }}
      style={{ background: "#0a0a0f" }}
    >
      <style>{`
        @keyframes floatUp {
          0%,100% { transform:translateY(0) scale(1); opacity:var(--op); }
          50%      { transform:translateY(-16px) scale(1.08); }
        }
        @keyframes shake {
          0%,100%{transform:translateX(0)} 15%{transform:translateX(-8px)} 30%{transform:translateX(8px)}
          45%{transform:translateX(-6px)} 60%{transform:translateX(6px)} 75%{transform:translateX(-3px)} 90%{transform:translateX(3px)}
        }
        @keyframes pulseGlow {
          0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,0)} 50%{box-shadow:0 0 24px 6px rgba(124,58,237,0.3)}
        }
        @keyframes scanLine {
          0%{top:0%;opacity:0.6} 100%{top:100%;opacity:0}
        }
        @keyframes digitPop {
          0%{transform:scale(1)} 40%{transform:scale(1.18)} 100%{transform:scale(1)}
        }
        @keyframes successFlash {
          0%{background:rgba(16,185,129,0.08)} 50%{background:rgba(16,185,129,0.2)} 100%{background:rgba(16,185,129,0.08)}
        }
        @keyframes stepSlideIn {
          from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)}
        }
      `}</style>
      <input
        ref={hiddenRef}
        type="tel"
        inputMode="numeric"
        maxLength={6}
        defaultValue=""
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          width: 1,
          height: 1,
        }}
      />

      {/* Lock icon */}
      <div className="relative flex items-center justify-center mb-5">
        <div
          className="absolute w-20 h-20 rounded-full"
          style={{
            background: "rgba(124,58,237,0.1)",
            animation: "pulseGlow 2.5s ease-in-out infinite",
          }}
        />
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center relative z-10"
          style={{
            background:
              "linear-gradient(135deg,rgba(124,58,237,0.25),rgba(168,85,247,0.15))",
            border: "1px solid rgba(124,58,237,0.35)",
          }}
        >
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div
              className="absolute w-full h-0.5"
              style={{
                background:
                  "linear-gradient(90deg,transparent,rgba(167,139,250,0.5),transparent)",
                animation: "scanLine 2.5s linear infinite",
              }}
            />
          </div>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="11"
              width="18"
              height="11"
              rx="2"
              stroke="#a78bfa"
              strokeWidth="2"
            />
            <path
              d="M7 11V7a5 5 0 0110 0v4"
              stroke="#a78bfa"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="16" r="1.5" fill="#a78bfa" />
          </svg>
        </div>
      </div>

      <p className="text-white font-black text-2xl mb-2 text-center">
        {mode === "set"
          ? step === "confirm"
            ? "Confirm Passcode"
            : "Create Passcode"
          : "Enter Passcode"}
      </p>
      <p className="text-white/70 text-sm text-center mb-10 leading-relaxed">
        {mode === "set"
          ? step === "confirm"
            ? "Re-enter your 6-digit passcode to confirm"
            : "Create a 6-digit passcode to secure your account"
          : "Enter your 6-digit passcode to continue"}
      </p>

      {/* Digit boxes */}
      <div className="flex items-center gap-3 mb-6" onClick={focusInput}>
        {currentDigits.map((d, i) => (
          <div
            key={i}
            className="w-12 h-14 rounded-2xl flex items-center justify-center font-black text-white transition-all"
            style={{
              background: d
                ? "rgba(255,255,255,0.3)"
                : "rgba(255,255,255,0.12)",
              border:
                i === filledCount && !loading
                  ? "2px solid rgba(255,255,255,0.9)"
                  : d
                    ? "2px solid rgba(255,255,255,0.6)"
                    : "2px solid rgba(255,255,255,0.2)",
              fontSize: 22,
              cursor: "text",
            }}
          >
            {d || ""}
          </div>
        ))}
      </div>

      {/* Clear */}
      {filledCount > 0 && !loading && (
        <button
          onClick={() => {
            setCurrentDigits(Array(6).fill(""));
            if (hiddenRef.current) hiddenRef.current.value = "";
            setError("");
            setTimeout(() => hiddenRef.current?.focus(), 50);
          }}
          className="mb-4 text-white/50 text-xs font-medium underline underline-offset-2"
        >
          Clear
        </button>
      )}

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4"
          style={{
            background: "rgba(239,68,68,0.2)",
            border: "1px solid rgba(239,68,68,0.4)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#fca5a5" strokeWidth="2" />
            <path
              d="M12 8v4M12 16h.01"
              stroke="#fca5a5"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-red-200 text-xs font-medium">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2">
          <svg
            className="animate-spin"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="3"
            />
            <path
              d="M12 2a10 10 0 0110 10"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-white/60 text-sm">
            {mode === "set" ? "Setting passcode..." : "Verifying..."}
          </p>
        </div>
      )}

      {/* Step indicator for set mode */}
      {mode === "set" && (
        <div className="flex items-center gap-2 mt-6">
          <div
            className="w-8 h-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.8)" }}
          />
          <div
            className="w-8 h-1.5 rounded-full transition-all"
            style={{
              background:
                step === "confirm"
                  ? "rgba(255,255,255,0.8)"
                  : "rgba(255,255,255,0.3)",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PasscodeScreen;
