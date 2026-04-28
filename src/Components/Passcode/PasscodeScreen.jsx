import React, { useState, useRef, useEffect } from "react";

const PasscodeScreen = ({ mode, walletAddress, onSuccess, onError }) => {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDigits, setConfirmDigits] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState("enter"); // "enter" | "confirm"
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, [step]);

  const handleChange = (index, value, isConfirm = false) => {
    if (!/^\d?$/.test(value)) return;
    const arr = isConfirm ? [...confirmDigits] : [...digits];
    arr[index] = value;
    if (isConfirm) setConfirmDigits(arr);
    else setDigits(arr);

    setError("");

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when last digit filled
    if (value && index === 5) {
      const code = arr.join("");
      if (code.length === 6) {
        setTimeout(() => handleSubmit(arr, isConfirm), 100);
      }
    }
  };

  const handleKeyDown = (index, e, isConfirm = false) => {
    if (e.key === "Backspace") {
      const arr = isConfirm ? [...confirmDigits] : [...digits];
      if (arr[index]) {
        arr[index] = "";
        if (isConfirm) setConfirmDigits(arr);
        else setDigits(arr);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // In handleSubmit inside PasscodeScreen, verify flow:
  const handleSubmit = async (digitArr, isConfirm = false) => {
    const code = digitArr.join("");
    if (code.length !== 6) return;

    if (mode === "set") {
      if (step === "enter") {
        setStep("confirm");
        setConfirmDigits(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
        return;
      }

      if (digits.join("") !== code) {
        setError("Passcodes do not match. Try again.");
        setDigits(["", "", "", "", "", ""]);
        setConfirmDigits(["", "", "", "", "", ""]);
        setStep("enter");
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
        return;
      }

      try {
        setLoading(true);
        const { setPasscode } = await import("../../api/auth.api");
        const res = await setPasscode({
          user_wallet: walletAddress,
          passcode: digits.join(""),
        });
        // ✅ Call onSuccess with user data returned from setPasscode
        onSuccess(res.data.user || null);
      } catch (err) {
        const errMsg = err?.response?.data?.error || "";

        // ✅ If passcode was already set (edge case) — treat as success
        // and switch to verify mode
        if (errMsg === "Passcode already set") {
          setError("Passcode already exists. Please verify instead.");
          setTimeout(() => {
            // Switch to verify mode
            onError("switch_to_verify");
          }, 1500);
          return;
        }

        setError(errMsg || "Failed to set passcode");
      } finally {
        setLoading(false);
      }
      return;
    }

    // mode === "verify"
    try {
      setLoading(true);
      const { verifyPasscode } = await import("../../api/auth.api");
      const res = await verifyPasscode({
        user_wallet: walletAddress,
        passcode: code,
      });
      onSuccess(res.data.user);
    } catch (err) {
      setError("Incorrect passcode. Try again.");
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  const currentDigits = step === "confirm" ? confirmDigits : digits;
  const isConfirmStep = step === "confirm";

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-8"
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

      {/* Logo / Icon */}
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

      {/* Digit inputs */}
      <div className="flex items-center gap-3 mb-6">
        {currentDigits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value, isConfirmStep)}
            onKeyDown={(e) => handleKeyDown(i, e, isConfirmStep)}
            className="w-12 h-14 rounded-2xl text-center text-white font-black text-xl outline-none transition-all"
            style={{
              background: d
                ? "rgba(255,255,255,0.3)"
                : "rgba(255,255,255,0.12)",
              border: d
                ? "2px solid rgba(255,255,255,0.6)"
                : "2px solid rgba(255,255,255,0.2)",
              caretColor: "transparent",
              fontSize: d ? 22 : 16,
            }}
          />
        ))}
      </div>

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
        <p className="text-white/60 text-sm">
          {mode === "set" ? "Setting passcode..." : "Verifying..."}
        </p>
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
