import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import toast from "react-hot-toast";
import { useUser } from "../../context/UserContext";
import { getLoanPackages, submitLoan } from "../../api/loan.api";

const STEPS = ["Personal", "Period", "Documents", "Amount"];

const StepBar = ({ current, total }) => (
  <div className="flex items-center gap-2 px-5 py-3">
    {Array.from({ length: total }).map((_, i) => (
      <React.Fragment key={i}>
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
          style={{
            background:
              i < current
                ? "linear-gradient(135deg,#6366f1,#a855f7)"
                : i === current
                  ? "linear-gradient(135deg,#f472b6,#a855f7)"
                  : "#e5e7eb",
            color: i <= current ? "white" : "#9ca3af",
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
                  : "#e5e7eb",
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
    setTimeout(() => {
      wrapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 320);
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
      <p className="text-gray-500 text-xs font-semibold mb-1.5">{label}</p>
      <input
        ref={inputRef}
        {...props}
        enterKeyHint={isLast ? "done" : "next"}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 text-sm font-medium outline-none transition-all placeholder-gray-300"
        style={{ WebkitAppearance: "none", fontSize: 16 }}
      />
    </div>
  );
};

const PhotoUpload = ({ label, sublabel, icon, preview, onChange }) => {
  const ref = useRef();
  return (
    <div>
      <p className="text-gray-600 text-xs font-semibold mb-2">{label}</p>
      <label
        className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden"
        style={{
          height: 120,
          borderColor: preview ? "#a855f7" : "#e0e7ff",
          background: preview
            ? "transparent"
            : "linear-gradient(135deg,#f0f0ff,#fdf4ff)",
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
            <p className="text-gray-600 text-xs font-semibold">{sublabel}</p>
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
          className="mt-1 text-xs text-indigo-400 font-medium w-full text-center"
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

  const nameRef = useRef(null);
  const addressRef = useRef(null);
  const phoneRef = useRef(null);
  const amountRef = useRef(null);
  const scrollRef = useRef(null);

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

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        height: "100dvh",
        background: "#f3f4f8",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&display=swap"
        rel="stylesheet"
      />

      <div className="flex-shrink-0">
        <Header pageTitle="Apply for Loan" />
      </div>

      {/* Step bar */}
      <div className="flex-shrink-0 px-4 pt-2 pb-1">
        <div className="bg-white rounded-2xl shadow-sm">
          <StepBar current={step} total={STEPS.length} />
          <div className="flex px-4 pb-2.5">
            {STEPS.map((s, i) => (
              <p
                key={i}
                className="flex-1 text-center text-xs font-semibold transition-colors"
                style={{
                  color:
                    i === step ? "#a855f7" : i < step ? "#6366f1" : "#9ca3af",
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
          <div className="bg-white rounded-3xl shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg,#6366f1,#a855f7)",
                }}
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
                <p className="text-gray-900 font-bold text-sm">
                  Personal Information
                </p>
                <p className="text-gray-400 text-xs">
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
          <div className="bg-white rounded-3xl shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg,#6366f1,#a855f7)",
                }}
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
                <p className="text-gray-900 font-bold text-sm">Loan Period</p>
                <p className="text-gray-400 text-xs">
                  Select your repayment duration
                </p>
              </div>
            </div>

            {loanPackages.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">
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
                        borderColor: active ? "#a855f7" : "#e5e7eb",
                        background: active
                          ? "linear-gradient(135deg,#f5f3ff,#fdf4ff)"
                          : "#f9fafb",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                          style={{
                            borderColor: active ? "#a855f7" : "#d1d5db",
                            background: active ? "#a855f7" : "transparent",
                          }}
                        >
                          {active && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span
                          className="font-bold text-sm"
                          style={{ color: active ? "#7c3aed" : "#374151" }}
                        >
                          {pkg.period_days} Days
                        </span>
                      </div>
                      <div className="text-right">
                        <p
                          className="text-xs font-semibold"
                          style={{ color: active ? "#a855f7" : "#9ca3af" }}
                        >
                          Interest
                        </p>
                        <p
                          className="font-black text-base"
                          style={{ color: active ? "#7c3aed" : "#374151" }}
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
            <div className="bg-white rounded-3xl shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#6366f1,#a855f7)",
                  }}
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
                  <p className="text-gray-900 font-bold text-sm">
                    Credit Card Photos
                  </p>
                  <p className="text-gray-400 text-xs">
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

            <div className="bg-white rounded-3xl shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#f472b6,#a855f7)",
                  }}
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
                  <p className="text-gray-900 font-bold text-sm">
                    ID Card Photo
                  </p>
                  <p className="text-gray-400 text-xs">
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
              <p className="text-gray-400 text-xs mt-3 text-center leading-relaxed">
                Ensure all text and photo are clearly visible
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Amount */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="bg-white rounded-3xl shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#6366f1,#a855f7)",
                  }}
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
                  <p className="text-gray-900 font-bold text-sm">Loan Amount</p>
                  <p className="text-gray-400 text-xs">
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
                  background: "linear-gradient(135deg,#f5f3ff,#fdf4ff)",
                  border: "2px solid #e9d5ff",
                }}
              >
                <span className="text-purple-400 font-black text-2xl flex-shrink-0">
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
                  className="flex-1 bg-transparent text-gray-900 font-black text-2xl outline-none placeholder-purple-200"
                  style={{
                    minWidth: 0,
                    fontSize: 24,
                    WebkitAppearance: "none",
                  }}
                />
                <span className="text-purple-400 font-bold text-sm flex-shrink-0">
                  USDT
                </span>
              </div>

              {/* Quick amounts */}
              <p className="text-gray-400 text-xs font-semibold mb-2">
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
                      className="py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                      style={{
                        background: active
                          ? "linear-gradient(135deg,#6366f1,#a855f7)"
                          : "#f3f4f6",
                        color: active ? "white" : "#6b7280",
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
                style={{ background: "#f9fafb", border: "1px solid #f0f0f0" }}
              >
                <p className="text-gray-700 font-bold text-xs mb-2">
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
                    <span className="text-gray-500 text-xs">{row.label}</span>
                    <span className="text-gray-800 font-bold text-xs">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div
              className="rounded-2xl p-4 flex gap-3"
              style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}
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
              <p className="text-orange-700 text-xs leading-relaxed">
                By submitting you agree to our loan terms. Data is confidential
                and used only for processing.
              </p>
            </div>
          </div>
        )}

        <div style={{ height: "env(keyboard-inset-height, 80px)" }} />
      </div>

      {/* Bottom nav */}
      <div
        className="flex-shrink-0 px-4 py-4 bg-white border-t border-gray-100"
        style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}
      >
        <div className="flex gap-3">
          <button
            onClick={() =>
              step === 0 ? navigate("/help-loan") : goStep(step - 1)
            }
            className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-gray-200 active:scale-95 transition-transform"
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="#6b7280"
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
            className="flex-1 py-3.5 rounded-2xl font-extrabold text-base transition-all active:scale-95"
            style={{
              background: canNext()
                ? "linear-gradient(90deg,#f472b6,#a855f7)"
                : "#e5e7eb",
              color: canNext() ? "white" : "#9ca3af",
              boxShadow: canNext()
                ? "0 8px 24px rgba(168,85,247,0.35)"
                : "none",
            }}
          >
            {step === STEPS.length - 1 ? "Submit Application" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpLoan;
