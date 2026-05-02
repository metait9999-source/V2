import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import Header from "../Header/Header";
import toast from "react-hot-toast";
import { verifyPasscode, setPasscode } from "../../api/auth.api";

const STEPS = {
  verify: {
    title: "Current Passcode",
    subtitle: "Enter your current 6-digit passcode",
    icon: "🔐",
  },
  enter: {
    title: "New Passcode",
    subtitle: "Enter your new 6-digit passcode",
    icon: "✏️",
  },
  confirm: {
    title: "Confirm Passcode",
    subtitle: "Re-enter your new passcode to confirm",
    icon: "✅",
  },
};

const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  size: 5 + (i % 4) * 4,
  x: 8 + ((i * 41) % 84),
  y: 8 + ((i * 57) % 84),
  dur: 9 + (i % 4) * 2,
  delay: -(i * 1.5),
  opacity: 0.04 + (i % 3) * 0.025,
}));

const ChangePasscode = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const hiddenRef = useRef(null);

  const [step, setStep] = useState("verify");
  const [verifyDigits, setVerifyDigits] = useState(Array(6).fill(""));
  const [newDigits, setNewDigits] = useState(Array(6).fill(""));
  const [confirmDigits, setConfirmDigits] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

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
    setTimeout(() => hiddenRef.current?.focus(), 100);
  }, [step]);

  const focusInput = (e) => {
    if (e?.target?.closest?.("[data-no-focus]")) return;
    hiddenRef.current?.focus();
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const resetCurrent = () => {
    setCurrentDigits(Array(6).fill(""));
    if (hiddenRef.current) hiddenRef.current.value = "";
    setError("");
    setTimeout(() => hiddenRef.current?.focus(), 50);
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

    if (step === "verify") {
      setLoading(true);
      try {
        await verifyPasscode({
          user_wallet: user?.user_wallet,
          passcode: code,
        });
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setStep("enter");
          setNewDigits(Array(6).fill(""));
          if (hiddenRef.current) hiddenRef.current.value = "";
        }, 400);
      } catch {
        triggerShake();
        setError("Incorrect passcode. Try again.");
        setVerifyDigits(Array(6).fill(""));
        if (hiddenRef.current) hiddenRef.current.value = "";
        setTimeout(() => hiddenRef.current?.focus(), 100);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === "enter") {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setStep("confirm");
        setConfirmDigits(Array(6).fill(""));
        if (hiddenRef.current) hiddenRef.current.value = "";
      }, 400);
      return;
    }

    if (step === "confirm") {
      if (newDigits.join("") !== code) {
        triggerShake();
        setError("Passcodes do not match. Try again.");
        setNewDigits(Array(6).fill(""));
        setConfirmDigits(Array(6).fill(""));
        setStep("enter");
        if (hiddenRef.current) hiddenRef.current.value = "";
        setTimeout(() => hiddenRef.current?.focus(), 100);
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
        triggerShake();
        setError(err?.response?.data?.error || "Failed to change passcode");
      } finally {
        setLoading(false);
      }
    }
  };

  const filledCount = currentDigits.filter((d) => d !== "").length;
  const allFilled = filledCount === 6;
  const stepIndex = { verify: 0, enter: 1, confirm: 2 }[step];
  const stepKeys = ["verify", "enter", "confirm"];

  return (
    <div
      className="fixed inset-0 flex flex-col"
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

      {/* Header */}
      <div className="flex-shrink-0">
        <Header pageTitle="Change Passcode" />
      </div>

      {/* Main area */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8 relative overflow-hidden"
        style={{ animation: success ? "successFlash 0.4s ease" : "none" }}
        onClick={focusInput}
      >
        {/* Particles */}
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              background: `rgba(124,58,237,${p.opacity})`,
              "--op": p.opacity,
              animation: `floatUp ${p.dur}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}

        {/* Grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(124,58,237,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.03) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Glow orb */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: 300,
            height: 300,
            background:
              "radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
          }}
        />

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

        {/* Step progress bar */}
        <div className="flex items-center gap-2 mb-8 relative z-10">
          {stepKeys.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className="rounded-full flex items-center justify-center font-bold transition-all duration-300"
                  style={{
                    width: 28,
                    height: 28,
                    fontSize: "3vw",
                    background:
                      i < stepIndex
                        ? "#7c3aed"
                        : i === stepIndex
                          ? "linear-gradient(135deg,#7c3aed,#a855f7)"
                          : "rgba(255,255,255,0.06)",
                    border:
                      i === stepIndex
                        ? "2px solid #a78bfa"
                        : "2px solid transparent",
                    color: i <= stepIndex ? "#fff" : "#475569",
                    boxShadow:
                      i === stepIndex
                        ? "0 0 12px rgba(124,58,237,0.5)"
                        : "none",
                  }}
                >
                  {i < stepIndex ? "✓" : i + 1}
                </div>
              </div>
              {i < 2 && (
                <div
                  className="h-0.5 rounded-full transition-all duration-500"
                  style={{
                    width: 28,
                    background:
                      i < stepIndex ? "#7c3aed" : "rgba(255,255,255,0.08)",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

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

        {/* Title — animate on step change */}
        <div style={{ animation: "stepSlideIn 0.3s ease" }}>
          <p
            className="font-black text-center mb-1"
            style={{
              fontSize: "6vw",
              color: "#f1f5f9",
              letterSpacing: "-0.02em",
            }}
          >
            {STEPS[step].title}
          </p>
          <p
            className="text-center mb-8 leading-relaxed"
            style={{ fontSize: "3.5vw", color: "#64748b" }}
          >
            {STEPS[step].subtitle}
          </p>
        </div>

        {/* Digit boxes */}
        <div
          className="flex items-center gap-3 mb-4 relative z-10"
          style={{ animation: shake ? "shake 0.5s ease" : "none" }}
          onClick={focusInput}
        >
          {currentDigits.map((d, i) => {
            const isActive = i === filledCount && !loading;
            const isFilled = !!d;
            return (
              <div
                key={i}
                className="flex items-center justify-center font-black transition-all"
                style={{
                  width: "12vw",
                  height: "14vw",
                  maxWidth: 52,
                  maxHeight: 60,
                  borderRadius: "0.875rem",
                  background: isFilled
                    ? "linear-gradient(135deg,rgba(124,58,237,0.35),rgba(168,85,247,0.2))"
                    : "rgba(255,255,255,0.03)",
                  border: isActive
                    ? "2px solid #a78bfa"
                    : isFilled
                      ? "2px solid rgba(124,58,237,0.45)"
                      : "2px solid rgba(255,255,255,0.07)",
                  boxShadow: isActive
                    ? "0 0 16px rgba(124,58,237,0.4)"
                    : isFilled
                      ? "0 0 8px rgba(124,58,237,0.15)"
                      : "none",
                  color: "#f1f5f9",
                  fontSize: 18,
                  cursor: "text",
                  animation: isFilled ? "digitPop 0.2s ease" : "none",
                }}
              >
                {d ? "●" : ""}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div
          className="w-44 h-1 rounded-full mb-5 overflow-hidden"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${(filledCount / 6) * 100}%`,
              background: allFilled
                ? "linear-gradient(90deg,#10b981,#34d399)"
                : "linear-gradient(90deg,#7c3aed,#a855f7)",
            }}
          />
        </div>

        {/* Clear */}
        {filledCount > 0 && !loading && (
          <button
            data-no-focus
            onClick={resetCurrent}
            className="mb-3 font-medium underline underline-offset-2"
            style={{
              fontSize: "3.2vw",
              color: "#475569",
              background: "transparent",
              border: "none",
            }}
          >
            Clear
          </button>
        )}

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-3"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#f87171" strokeWidth="2" />
              <path
                d="M12 8v4M12 16h.01"
                stroke="#f87171"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <p
              className="font-medium"
              style={{ fontSize: "3.2vw", color: "#fca5a5" }}
            >
              {error}
            </p>
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
                stroke="rgba(167,139,250,0.3)"
                strokeWidth="3"
              />
              <path
                d="M12 2a10 10 0 0110 10"
                stroke="#a78bfa"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <p style={{ fontSize: "3.5vw", color: "#64748b" }}>
              {step === "verify" ? "Verifying..." : "Saving..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangePasscode;
