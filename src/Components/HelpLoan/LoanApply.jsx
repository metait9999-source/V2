import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import toast from "react-hot-toast";
import { useUser } from "../../context/UserContext";
import { getLoanPackages, submitLoan } from "../../api/loan.api";

/* ─── Theme ── */
const DARK_BG = "#0a0a0f";
const DARK_CARD = "rgba(255,255,255,0.04)";
const DARK_CARD2 = "#111118";
const DARK_BORDER = "rgba(255,255,255,0.07)";
const TEXT_PRIMARY = "#f1f5f9";
const TEXT_MUTED = "#64748b";

const STEPS = ["Personal", "Period", "Documents", "Amount"];

const StepBar = ({ current, total }) => (
  <div className="flex items-center gap-2 px-5 py-3">
    {Array.from({ length: total }).map((_, i) => (
      <React.Fragment key={i}>
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold transition-all duration-300"
          style={{
            fontSize: "3vw",
            background:
              i < current
                ? "linear-gradient(135deg,#6366f1,#a855f7)"
                : i === current
                  ? "linear-gradient(135deg,#f472b6,#a855f7)"
                  : "rgba(255,255,255,0.08)",
            color: i <= current ? "white" : TEXT_MUTED,
          }}
        >
          {i < current ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6l3 3 5-5"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            i + 1
          )}
        </div>
        {i < total - 1 && (
          <div
            className="flex-1 h-0.5 rounded-full transition-all duration-500"
            style={{
              background:
                i < current
                  ? "linear-gradient(90deg,#6366f1,#a855f7)"
                  : "rgba(255,255,255,0.08)",
            }}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

const SmartInput = ({ label, inputRef, nextRef, isLast = false, ...props }) => {
  const wrapRef = useRef(null);
  const handleFocus = useCallback(() => {
    setTimeout(
      () =>
        wrapRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        }),
      320,
    );
  }, []);
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextRef?.current) nextRef.current.focus();
      else inputRef?.current?.blur();
    }
  };
  return (
    <div ref={wrapRef}>
      <p
        className="font-semibold mb-1.5"
        style={{ fontSize: "3.2vw", color: TEXT_MUTED }}
      >
        {label}
      </p>
      <input
        ref={inputRef}
        {...props}
        enterKeyHint={isLast ? "done" : "next"}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all placeholder-gray-600"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: `1px solid ${DARK_BORDER}`,
          color: TEXT_PRIMARY,
          fontSize: 16,
          WebkitAppearance: "none",
        }}
      />
    </div>
  );
};

const PhotoUpload = ({ label, sublabel, icon, preview, onChange }) => {
  const ref = useRef();
  return (
    <div>
      <p
        className="font-semibold mb-2"
        style={{ fontSize: "3.2vw", color: TEXT_MUTED }}
      >
        {label}
      </p>
      <label
        className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden"
        style={{
          height: 120,
          borderColor: preview ? "#a855f7" : "rgba(255,255,255,0.12)",
          background: preview ? "transparent" : "rgba(99,102,241,0.06)",
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt={label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 pointer-events-none select-none">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
            >
              {icon}
            </div>
            <p
              className="font-semibold"
              style={{ fontSize: "3.2vw", color: TEXT_MUTED }}
            >
              {sublabel}
            </p>
          </div>
        )}
        <input
          ref={ref}
          type="file"
          accept="image/*"
          capture="environment"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={onChange}
        />
      </label>
      {preview && (
        <button
          onClick={() => {
            onChange({ target: { files: [] } });
            ref.current.value = "";
          }}
          className="mt-1 w-full text-center"
          style={{
            fontSize: "3vw",
            color: "#818cf8",
            background: "transparent",
            border: "none",
          }}
        >
          Change photo
        </button>
      )}
    </div>
  );
};

const HelpLoan = () => {
  const navigate = useNavigate();
  const { user, setLoading } = useUser();
  const [step, setStep] = useState(0);
  const [loanPackages, setLoanPackages] = useState([]);

  const [form, setForm] = useState({
    fullName: "",
    homeAddress: "",
    phone: "",
    package_id: null,
    period: null,
    rate: null,
    min_amount: null,
    max_amount: null,
    loanAmount: "",
    creditFront: null,
    creditFrontPreview: null,
    creditBack: null,
    creditBackPreview: null,
    idCard: null,
    idCardPreview: null,
  });

  useEffect(() => {
    getLoanPackages()
      .then((res) => setLoanPackages(res.data))
      .catch(() => toast.error("Failed to load loan packages"));
  }, []);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const selectPackage = (pkg) => {
    setForm((f) => ({
      ...f,
      package_id: pkg.id,
      period: pkg.period_days,
      rate: parseFloat(pkg.interest_rate),
      min_amount: parseFloat(pkg.min_amount),
      max_amount: parseFloat(pkg.max_amount),
    }));
  };

  const handlePhoto = (key, previewKey) => (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      set(key, null);
      set(previewKey, null);
      return;
    }
    set(key, file);
    set(previewKey, URL.createObjectURL(file));
  };

  const nameRef = useRef(null),
    addressRef = useRef(null),
    phoneRef = useRef(null),
    amountRef = useRef(null),
    scrollRef = useRef(null);

  const goStep = (next) => {
    setStep(next);
    setTimeout(
      () => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }),
      50,
    );
  };

  const canNext = () => {
    if (step === 0)
      return (
        form.fullName.trim() && form.homeAddress.trim() && form.phone.trim()
      );
    if (step === 1) return !!form.package_id;
    if (step === 2) return form.creditFront && form.creditBack && form.idCard;
    if (step === 3) return form.loanAmount && parseFloat(form.loanAmount) > 0;
    return true;
  };

  const handleSubmit = async () => {
    const amount = parseFloat(form.loanAmount);
    if (form.min_amount && amount < form.min_amount) {
      toast.error(`Minimum amount is ${form.min_amount.toLocaleString()} USDT`);
      return;
    }
    if (form.max_amount && amount > form.max_amount) {
      toast.error(`Maximum amount is ${form.max_amount.toLocaleString()} USDT`);
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("user_id", user?.id);
      fd.append("package_id", form.package_id);
      fd.append("full_name", form.fullName);
      fd.append("home_address", form.homeAddress);
      fd.append("phone", form.phone);
      fd.append("loan_amount", form.loanAmount);
      fd.append("credit_front", form.creditFront);
      fd.append("credit_back", form.creditBack);
      fd.append("id_card", form.idCard);
      await submitLoan(fd);
      setLoading(false);
      toast.success("Loan application submitted successfully!");
      navigate("/loan-history");
    } catch (err) {
      setLoading(false);
      toast.error(
        err?.response?.data?.error || "Submission failed. Please try again.",
      );
    }
  };

  const totalRepay =
    form.loanAmount && form.rate
      ? (parseFloat(form.loanAmount) * (1 + form.rate / 100)).toLocaleString(
          undefined,
          { maximumFractionDigits: 2 },
        )
      : "—";

  /* shared card style */
  const card = {
    background: DARK_CARD,
    border: `1px solid ${DARK_BORDER}`,
    borderRadius: "1.5rem",
  };
  const sectionIcon = (gradient) => ({
    background: `linear-gradient(135deg,${gradient})`,
  });

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "100dvh", background: DARK_BG }}
    >
      <div className="flex-shrink-0">
        <Header pageTitle="Apply for Loan" />
      </div>

      {/* Step bar */}
      <div className="flex-shrink-0 px-4 pt-2 pb-1">
        <div
          className="rounded-2xl"
          style={{ background: DARK_CARD2, border: `1px solid ${DARK_BORDER}` }}
        >
          <StepBar current={step} total={STEPS.length} />
          <div className="flex px-4 pb-2.5">
            {STEPS.map((s, i) => (
              <p
                key={i}
                className="flex-1 text-center font-semibold transition-colors"
                style={{
                  fontSize: "3vw",
                  color:
                    i === step ? "#a855f7" : i < step ? "#818cf8" : TEXT_MUTED,
                }}
              >
                {s}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3"
        style={{ overscrollBehavior: "contain" }}
      >
        {/* STEP 0: Personal */}
        {step === 0 && (
          <div className="p-5 space-y-4" style={card}>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={sectionIcon("#6366f1,#a855f7")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="7" r="4" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              <div>
                <p
                  className="font-bold"
                  style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
                >
                  Personal Information
                </p>
                <p style={{ fontSize: "3vw", color: TEXT_MUTED }}>
                  Please fill in your real details
                </p>
              </div>
            </div>
            <SmartInput
              label="Full Name"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              inputRef={nameRef}
              nextRef={addressRef}
              autoComplete="name"
              autoCapitalize="words"
            />
            <SmartInput
              label="Home Address"
              placeholder="Enter your home address"
              value={form.homeAddress}
              onChange={(e) => set("homeAddress", e.target.value)}
              inputRef={addressRef}
              nextRef={phoneRef}
              autoComplete="street-address"
            />
            <SmartInput
              label="Phone Number"
              placeholder="+1 000 000 0000"
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              inputRef={phoneRef}
              isLast
              autoComplete="tel"
              inputMode="tel"
            />
          </div>
        )}

        {/* STEP 1: Period */}
        {step === 1 && (
          <div className="p-5" style={card}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={sectionIcon("#6366f1,#a855f7")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="18"
                    rx="2"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <path
                    d="M16 2v4M8 2v4M3 10h18"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <p
                  className="font-bold"
                  style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
                >
                  Loan Period
                </p>
                <p style={{ fontSize: "3vw", color: TEXT_MUTED }}>
                  Select your repayment duration
                </p>
              </div>
            </div>
            {loanPackages.length === 0 ? (
              <p
                className="text-center py-8"
                style={{ fontSize: "3.5vw", color: TEXT_MUTED }}
              >
                Loading packages...
              </p>
            ) : (
              <div className="space-y-2.5">
                {loanPackages.map((pkg) => {
                  const active = form.package_id === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      onClick={() => selectPackage(pkg)}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all active:scale-[0.98]"
                      style={{
                        borderColor: active ? "#a855f7" : DARK_BORDER,
                        background: active
                          ? "rgba(168,85,247,0.12)"
                          : "rgba(255,255,255,0.03)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                          style={{
                            borderColor: active ? "#a855f7" : TEXT_MUTED,
                            background: active ? "#a855f7" : "transparent",
                          }}
                        >
                          {active && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span
                          className="font-bold"
                          style={{
                            fontSize: "3.8vw",
                            color: active ? "#a78bfa" : TEXT_PRIMARY,
                          }}
                        >
                          {pkg.period_days} Days
                        </span>
                      </div>
                      <div className="text-right">
                        <p
                          style={{
                            fontSize: "3vw",
                            color: active ? "#a78bfa" : TEXT_MUTED,
                          }}
                        >
                          Interest
                        </p>
                        <p
                          className="font-black"
                          style={{
                            fontSize: "4.5vw",
                            color: active ? "#a78bfa" : TEXT_PRIMARY,
                          }}
                        >
                          {pkg.interest_rate}%
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Documents */}
        {step === 2 && (
          <div className="space-y-3">
            <div className="p-5" style={card}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={sectionIcon("#6366f1,#a855f7")}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="2"
                      y="5"
                      width="20"
                      height="14"
                      rx="2"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <path d="M2 10h20" stroke="white" strokeWidth="2" />
                  </svg>
                </div>
                <div>
                  <p
                    className="font-bold"
                    style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
                  >
                    Credit Card Photos
                  </p>
                  <p style={{ fontSize: "3vw", color: TEXT_MUTED }}>
                    Front and back of your card
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <PhotoUpload
                  label="Front side"
                  sublabel="Card Front"
                  preview={form.creditFrontPreview}
                  onChange={handlePhoto("creditFront", "creditFrontPreview")}
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="2"
                        y="5"
                        width="20"
                        height="14"
                        rx="2"
                        stroke="white"
                        strokeWidth="1.8"
                      />
                      <circle cx="7" cy="12" r="2" fill="white" opacity="0.7" />
                    </svg>
                  }
                />
                <PhotoUpload
                  label="Back side"
                  sublabel="Card Back"
                  preview={form.creditBackPreview}
                  onChange={handlePhoto("creditBack", "creditBackPreview")}
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="2"
                        y="5"
                        width="20"
                        height="14"
                        rx="2"
                        stroke="white"
                        strokeWidth="1.8"
                      />
                      <path d="M2 10h20" stroke="white" strokeWidth="1.8" />
                    </svg>
                  }
                />
              </div>
            </div>
            <div className="p-5" style={card}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={sectionIcon("#f472b6,#a855f7")}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="2"
                      y="4"
                      width="20"
                      height="16"
                      rx="2"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <circle
                      cx="8"
                      cy="11"
                      r="2.5"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M13 9h5M13 13h5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <p
                    className="font-bold"
                    style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
                  >
                    ID Card Photo
                  </p>
                  <p style={{ fontSize: "3vw", color: TEXT_MUTED }}>
                    Government issued ID required
                  </p>
                </div>
              </div>
              <PhotoUpload
                label="ID Card"
                sublabel="Upload ID Card"
                preview={form.idCardPreview}
                onChange={handlePhoto("idCard", "idCardPreview")}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="2"
                      y="4"
                      width="20"
                      height="16"
                      rx="2"
                      stroke="white"
                      strokeWidth="1.8"
                    />
                    <circle
                      cx="8"
                      cy="11"
                      r="2.5"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M13 9h5M13 13h3"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                }
              />
              <p
                className="text-center mt-3 leading-relaxed"
                style={{ fontSize: "3vw", color: TEXT_MUTED }}
              >
                Ensure all text and photo are clearly visible
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Amount */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="p-5" style={card}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={sectionIcon("#6366f1,#a855f7")}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <path
                      d="M9 12h6M12 9v6"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <p
                    className="font-bold"
                    style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
                  >
                    Loan Amount
                  </p>
                  <p style={{ fontSize: "3vw", color: TEXT_MUTED }}>
                    {form.min_amount && form.max_amount
                      ? `${form.min_amount.toLocaleString()} – ${form.max_amount.toLocaleString()} USDT`
                      : "Enter the amount you need"}
                  </p>
                </div>
              </div>

              {/* Amount input */}
              <div
                className="rounded-2xl px-4 py-4 mb-4 flex items-center gap-3"
                style={{
                  background: "rgba(168,85,247,0.1)",
                  border: "2px solid rgba(168,85,247,0.3)",
                }}
              >
                <span
                  className="font-black flex-shrink-0"
                  style={{ fontSize: "6vw", color: "#a78bfa" }}
                >
                  $
                </span>
                <input
                  ref={amountRef}
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={form.loanAmount}
                  onChange={(e) => set("loanAmount", e.target.value)}
                  enterKeyHint="done"
                  onFocus={() =>
                    setTimeout(
                      () =>
                        amountRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        }),
                      320,
                    )
                  }
                  className="flex-1 bg-transparent font-black outline-none"
                  style={{
                    minWidth: 0,
                    fontSize: 24,
                    color: TEXT_PRIMARY,
                    WebkitAppearance: "none",
                  }}
                />
                <span
                  className="font-bold flex-shrink-0"
                  style={{ fontSize: "3.5vw", color: "#a78bfa" }}
                >
                  USDT
                </span>
              </div>

              {/* Quick amounts */}
              <p
                className="font-semibold mb-2"
                style={{ fontSize: "3vw", color: "white" }}
              >
                Quick select
              </p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[1000, 5000, 10000, 20000, 30000, 50000].map((amt) => {
                  const active = parseFloat(form.loanAmount) === amt;
                  const withinRange =
                    !form.max_amount || amt <= form.max_amount;
                  if (!withinRange) return null;
                  return (
                    <button
                      key={amt}
                      onClick={() => {
                        set("loanAmount", amt.toString());
                        amountRef.current?.blur();
                      }}
                      className="py-2.5 rounded-xl font-bold transition-all active:scale-95"
                      style={{
                        fontSize: "3.2vw",
                        background: active
                          ? "linear-gradient(135deg,#6366f1,#a855f7)"
                          : "rgba(255,255,255,0.06)",
                        color: active ? "white" : "white",
                        border: "none",
                      }}
                    >
                      {amt >= 1000 ? `${amt / 1000}K` : amt}
                    </button>
                  );
                })}
              </div>

              {/* Summary */}
              <div
                className="rounded-2xl p-4 space-y-2.5"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${DARK_BORDER}`,
                }}
              >
                <p
                  className="font-bold mb-2"
                  style={{ fontSize: "3.2vw", color: TEXT_MUTED }}
                >
                  Loan Summary
                </p>
                {[
                  {
                    label: "Amount",
                    value: form.loanAmount
                      ? `${parseFloat(form.loanAmount).toLocaleString()} USDT`
                      : "—",
                  },
                  {
                    label: "Period",
                    value: form.period ? `${form.period} Days` : "—",
                  },
                  {
                    label: "Interest",
                    value: form.rate ? `${form.rate}%` : "—",
                  },
                  {
                    label: "Total Repay",
                    value: totalRepay !== "—" ? `${totalRepay} USDT` : "—",
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between"
                  >
                    <span style={{ fontSize: "3.2vw", color: TEXT_MUTED }}>
                      {row.label}
                    </span>
                    <span
                      className="font-bold"
                      style={{ fontSize: "3.2vw", color: TEXT_PRIMARY }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div
              className="rounded-2xl p-4 flex gap-3"
              style={{
                background: "rgba(249,115,22,0.1)",
                border: "1px solid rgba(249,115,22,0.25)",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="flex-shrink-0 mt-0.5"
              >
                <path
                  d="M12 2L2 19h20L12 2z"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 9v4M12 16h.01"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <p
                style={{ fontSize: "3.2vw", color: "#fb923c", lineHeight: 1.6 }}
              >
                By submitting you agree to our loan terms. Data is confidential
                and used only for processing.
              </p>
            </div>
          </div>
        )}

        <div style={{ height: "env(keyboard-inset-height,80px)" }} />
      </div>

      {/* Bottom nav */}
      <div
        className="flex-shrink-0 px-4 py-4 flex gap-3"
        style={{ background: DARK_BG, borderTop: `1px solid ${DARK_BORDER}` }}
      >
        <button
          onClick={() =>
            step === 0 ? navigate("/loan-landing") : goStep(step - 1)
          }
          className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border-2 active:scale-95 transition-transform"
          style={{ borderColor: DARK_BORDER, background: DARK_CARD }}
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="#a78bfa"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          disabled={!canNext()}
          onClick={() => {
            document.activeElement?.blur();
            if (step < STEPS.length - 1) goStep(step + 1);
            else handleSubmit();
          }}
          className="flex-1 py-3.5 rounded-2xl font-extrabold transition-all active:scale-95"
          style={{
            fontSize: "4vw",
            background: canNext()
              ? "linear-gradient(90deg,#f472b6,#a855f7)"
              : "rgba(255,255,255,0.06)",
            color: canNext() ? "white" : TEXT_MUTED,
            boxShadow: canNext() ? "0 8px 24px rgba(168,85,247,0.35)" : "none",
            border: "none",
          }}
        >
          {step === STEPS.length - 1 ? "Submit Application" : "Continue →"}
        </button>
      </div>
    </div>
  );
};

export default HelpLoan;
