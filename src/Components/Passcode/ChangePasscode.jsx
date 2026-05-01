import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import Header from "../Header/Header";
import toast from "react-hot-toast";
import { verifyPasscode, setPasscode } from "../../api/auth.api";

// ── Step config ───────────────────────────────────────────
const STEPS = {
  verify: {
    title: "Current Passcode",
    subtitle: "Enter your current 6-digit passcode",
  },
  enter: { title: "New Passcode", subtitle: "Enter your new 6-digit passcode" },
  confirm: {
    title: "Confirm Passcode",
    subtitle: "Re-enter your new passcode to confirm",
  },
};

// ── Digit boxes ───────────────────────────────────────────
const DigitBoxes = ({ digits, filledCount, loading, onClick }) => (
  <div className="flex items-center gap-3 mb-6" onClick={onClick}>
    {digits.map((d, i) => (
      <div
        key={i}
        className="w-12 h-14 rounded-2xl flex items-center justify-center font-black text-white transition-all"
        style={{
          background: d ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.12)",
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
);

// ── Main component ────────────────────────────────────────
const ChangePasscode = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const hiddenInputRef = useRef(null);

  const [step, setStep] = useState("verify"); // verify → enter → confirm
  const [verifyDigits, setVerifyDigits] = useState(Array(6).fill(""));
  const [newDigits, setNewDigits] = useState(Array(6).fill(""));
  const [confirmDigits, setConfirmDigits] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentDigits =
    step === "verify"
      ? verifyDigits
      : step === "enter"
        ? newDigits
        : confirmDigits;

  const setCurrentDigits =
    step === "verify"
      ? setVerifyDigits
      : step === "enter"
        ? setNewDigits
        : setConfirmDigits;

  useEffect(() => {
    setTimeout(() => hiddenInputRef.current?.focus(), 100);
  }, [step]);

  const focusInput = (e) => {
    if (e?.target?.closest?.("[data-no-focus]")) return;
    hiddenInputRef.current?.focus();
  };

  const resetCurrent = () => {
    setCurrentDigits(Array(6).fill(""));
    if (hiddenInputRef.current) hiddenInputRef.current.value = "";
    setError("");
    setTimeout(() => hiddenInputRef.current?.focus(), 50);
  };

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
      const current = currentDigits.join("");
      if (current.length === 0) return;
      const next = current.slice(0, -1).split("");
      while (next.length < 6) next.push("");
      setCurrentDigits(next);
      setError("");
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
    if (pasted.length === 6) setTimeout(() => handleSubmit(arr), 100);
  };

  const handleSubmit = async (digitArr) => {
    const arr = digitArr || currentDigits;
    const code = arr.join("");
    if (code.length !== 6) return;

    // ── Step 1: Verify current passcode ──
    if (step === "verify") {
      setLoading(true);
      try {
        await verifyPasscode({
          user_wallet: user?.user_wallet,
          passcode: code,
        });
        setStep("enter");
        setNewDigits(Array(6).fill(""));
        if (hiddenInputRef.current) hiddenInputRef.current.value = "";
      } catch {
        setError("Incorrect passcode. Try again.");
        setVerifyDigits(Array(6).fill(""));
        if (hiddenInputRef.current) hiddenInputRef.current.value = "";
        setTimeout(() => hiddenInputRef.current?.focus(), 100);
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── Step 2: Enter new passcode ──
    if (step === "enter") {
      setStep("confirm");
      setConfirmDigits(Array(6).fill(""));
      if (hiddenInputRef.current) hiddenInputRef.current.value = "";
      return;
    }

    // ── Step 3: Confirm new passcode ──
    if (step === "confirm") {
      if (newDigits.join("") !== code) {
        setError("Passcodes do not match. Try again.");
        setNewDigits(Array(6).fill(""));
        setConfirmDigits(Array(6).fill(""));
        setStep("enter");
        if (hiddenInputRef.current) hiddenInputRef.current.value = "";
        setTimeout(() => hiddenInputRef.current?.focus(), 100);
        return;
      }

      setLoading(true);
      try {
        await setPasscode({
          user_wallet: user?.user_wallet,
          passcode: newDigits.join(""),
        });
        toast.success("Passcode changed successfully!");
        navigate(-1);
      } catch (err) {
        setError(err?.response?.data?.error || "Failed to change passcode");
      } finally {
        setLoading(false);
      }
    }
  };

  const filledCount = currentDigits.filter((d) => d !== "").length;
  const stepIndex = { verify: 0, enter: 1, confirm: 2 }[step];

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&display=swap"
        rel="stylesheet"
      />

      <Header pageTitle="Change Passcode" />

      {/* Main area */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8"
        style={{
          background:
            "linear-gradient(145deg,#7c3aed 0%,#a855f7 50%,#ec4899 100%)",
        }}
        onClick={focusInput}
      >
        {/* Hidden input */}
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

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {["verify", "enter", "confirm"].map((s, i) => (
            <div
              key={s}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === stepIndex ? 28 : 20,
                background:
                  i <= stepIndex
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>

        {/* Lock icon */}
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center mb-6"
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
          {STEPS[step].title}
        </p>
        <p className="text-white/70 text-sm text-center mb-10 leading-relaxed">
          {STEPS[step].subtitle}
        </p>

        {/* Digit boxes */}
        <DigitBoxes
          digits={currentDigits}
          filledCount={filledCount}
          loading={loading}
          onClick={focusInput}
        />

        {/* Clear button */}
        {filledCount > 0 && !loading && (
          <button
            data-no-focus
            onClick={resetCurrent}
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
              {step === "verify" ? "Verifying..." : "Saving..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangePasscode;
