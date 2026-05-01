import React, { useState, useRef, useEffect } from "react";

const PasscodeScreen = ({ mode, walletAddress, onSuccess, onError }) => {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDigits, setConfirmDigits] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState("enter");
  const hiddenInputRef = useRef(null);

  const currentDigits = step === "confirm" ? confirmDigits : digits;
  const setCurrentDigits = step === "confirm" ? setConfirmDigits : setDigits;

  useEffect(() => {
    setTimeout(() => hiddenInputRef.current?.focus(), 100);
  }, [step]);

  const focusInput = () => hiddenInputRef.current?.focus();

  const handleInput = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 6);
    const arr = raw.split("");
    while (arr.length < 6) arr.push("");
    setCurrentDigits(arr);
    setError("");

    if (raw.length === 6) {
      setTimeout(() => handleSubmit(arr), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Backspace") {
      const current = currentDigits.join("");
      if (current.length === 0) return;
      const next = current.slice(0, -1).split("");
      while (next.length < 6) next.push("");
      setCurrentDigits(next);
      setError("");
      // Keep hidden input in sync
      e.target.value = current.slice(0, -1);
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const arr = pasted.split("");
    while (arr.length < 6) arr.push("");
    setCurrentDigits(arr);
    setError("");
    if (pasted.length === 6) {
      setTimeout(() => handleSubmit(arr), 100);
    }
  };

  const handleSubmit = async (digitArr) => {
    const arr = digitArr || currentDigits;
    const code = arr.join("");
    if (code.length !== 6) return;

    if (mode === "set") {
      if (step === "enter") {
        setStep("confirm");
        setConfirmDigits(["", "", "", "", "", ""]);
        if (hiddenInputRef.current) hiddenInputRef.current.value = "";
        setTimeout(() => hiddenInputRef.current?.focus(), 100);
        return;
      }

      if (digits.join("") !== code) {
        setError("Passcodes do not match. Try again.");
        setDigits(["", "", "", "", "", ""]);
        setConfirmDigits(["", "", "", "", "", ""]);
        setStep("enter");
        if (hiddenInputRef.current) hiddenInputRef.current.value = "";
        setTimeout(() => hiddenInputRef.current?.focus(), 100);
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
        const errMsg = err?.response?.data?.error || "";
        if (errMsg === "Passcode already set") {
          setError("Passcode already exists. Please verify instead.");
          setTimeout(() => onError("switch_to_verify"), 1500);
          return;
        }
        setError(errMsg || "Failed to set passcode");
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
      setDigits(["", "", "", "", "", ""]);
      if (hiddenInputRef.current) hiddenInputRef.current.value = "";
      setTimeout(() => hiddenInputRef.current?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  const filledCount = currentDigits.filter((d) => d !== "").length;

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-8"
      onClick={(e) => {
        // ✅ Don't refocus if clicking the chat button or its children
        if (e.target.closest("[data-chat-button]")) return;
        focusInput();
      }}
      style={{
        background:
          "linear-gradient(145deg,#7c3aed 0%,#a855f7 50%,#ec4899 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&display=swap"
        rel="stylesheet"
      />

      {/* Hidden real input */}
      <input
        ref={hiddenInputRef}
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

      {/* Icon */}
      <div
        className="w-16 h-16 rounded-3xl flex items-center justify-center mb-8"
        style={{ background: "rgba(255,255,255,0.15)" }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="11"
            width="18"
            height="11"
            rx="2"
            stroke="white"
            strokeWidth="2"
          />
          <path
            d="M7 11V7a5 5 0 0110 0v4"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="16" r="1.5" fill="white" />
        </svg>
      </div>

      {/* Title */}
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

      {/* Visual boxes — display only */}
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
                  ? "2px solid rgba(255,255,255,0.9)" // active box highlight
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

      {/* Clear button */}
      {filledCount > 0 && !loading && (
        <button
          onClick={() => {
            setCurrentDigits(["", "", "", "", "", ""]);
            if (hiddenInputRef.current) hiddenInputRef.current.value = "";
            setError("");
            setTimeout(() => hiddenInputRef.current?.focus(), 50);
          }}
          className="mb-4 text-white/50 text-xs font-medium underline underline-offset-2 hover:text-white/80 transition-colors"
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

      {/* Step indicator */}
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
