import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import axios from "axios";
import { API_BASE_URL } from "../../api/getApiURL";
import { useUser } from "../../context/UserContext";

const FaceVerification = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState("intro");
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ Check if already verified on mount
  useEffect(() => {
    if (user?.face_image) {
      setStep("already_verified");
    }
  }, [user]);

  const openCamera = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileAge = Date.now() - file.lastModified;
    const isFreshPhoto = fileAge < 60 * 1000;

    if (!isFreshPhoto) {
      e.target.value = "";
      setErrorMsg(
        "Please take a live selfie using the camera, not a photo from your gallery.",
      );
      setStep("gallery_error");
      return;
    }

    setCapturedFile(file);
    setCapturedImage(URL.createObjectURL(file));
    setStep("preview");
    e.target.value = "";
  };

  const retake = () => {
    setCapturedImage(null);
    setCapturedFile(null);
    fileInputRef.current?.click();
  };

  const submitFace = async () => {
    if (!capturedFile) return;
    setStep("uploading");
    try {
      const formData = new FormData();
      formData.append("user_id", user?.id);
      formData.append("face_image", capturedFile, "face.jpg");
      await axios.post(`${API_BASE_URL}/users/face-verify`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStep("done");
    } catch {
      setErrorMsg("Upload failed. Please check your connection and try again.");
      setStep("error");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#f3f4f8", fontFamily: "'DM Sans', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&display=swap"
        rel="stylesheet"
      />
      <Header pageTitle="Face Verification" onBack={() => navigate(-1)} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex-1 flex flex-col px-4 py-5">
        {/* ── ALREADY VERIFIED ── */}
        {step === "already_verified" && (
          <div className="flex flex-col items-center">
            {/* Hero */}
            <div
              className="w-full rounded-3xl p-6 mb-5 flex flex-col items-center relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg,#10b981 0%,#059669 100%)",
              }}
            >
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
                style={{
                  background: "#fff",
                  filter: "blur(40px)",
                  transform: "translate(30%,-30%)",
                }}
              />
              {/* Face image preview */}
              <div className="w-28 h-28 rounded-full mb-4 overflow-hidden border-4 border-white/40 shadow-xl relative z-10">
                <img
                  src={`${API_BASE_URL}/${user.face_image}`}
                  alt="Face"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentNode.style.background =
                      "rgba(255,255,255,0.2)";
                  }}
                />
              </div>
              <p className="text-white font-black text-2xl mb-1 relative z-10">
                Verified ✓
              </p>
              <p className="text-white/70 text-sm text-center relative z-10">
                Your face has been successfully verified
              </p>
            </div>

            {/* Success card */}
            <div className="w-full bg-white rounded-3xl shadow-sm p-5 mb-5">
              <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">
                    Face Verification Complete
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Your identity has been submitted for review
                  </p>
                </div>
              </div>

              {/* Status rows */}
              {[
                {
                  label: "Status",
                  value: "Submitted",
                  color: "#10b981",
                  bg: "#d1fae5",
                },
                {
                  label: "Method",
                  value: "Face Selfie",
                  color: "#6366f1",
                  bg: "#e0e7ff",
                },
                {
                  label: "Submitted",
                  value: "Photo on file",
                  color: "#f59e0b",
                  bg: "#fef3c7",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between mb-3"
                >
                  <p className="text-gray-400 text-sm">{row.label}</p>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: row.bg, color: row.color }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Notice */}
            <div
              className="w-full rounded-2xl p-4 flex gap-3 mb-5"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="flex-shrink-0 mt-0.5"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#10b981"
                  strokeWidth="2"
                />
                <path
                  d="M12 8v4M12 16h.01"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-emerald-700 text-xs leading-relaxed">
                Your face photo has been submitted. Our team will review and
                verify your identity. You will be notified once verification is
                complete.
              </p>
            </div>

            {/* Re-submit option */}
            <button
              onClick={() => setStep("intro")}
              className="w-full py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm mb-3 transition-transform active:scale-95"
            >
              🔄 Re-submit Photo
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full py-4 rounded-2xl text-white font-black text-base transition-transform active:scale-95"
              style={{
                background: "linear-gradient(90deg,#10b981,#0d9488)",
                boxShadow: "0 8px 24px rgba(16,185,129,0.4)",
              }}
            >
              Done
            </button>
          </div>
        )}

        {/* ── INTRO ── */}
        {step === "intro" && (
          <div className="flex flex-col items-center">
            <div
              className="w-full rounded-3xl p-6 mb-5 flex flex-col items-center relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg,#10b981 0%,#0d9488 100%)",
              }}
            >
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
                style={{
                  background: "#fff",
                  filter: "blur(40px)",
                  transform: "translate(30%,-30%)",
                }}
              />
              <div
                className="w-24 h-24 rounded-3xl mb-4 flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 3H5a2 2 0 00-2 2v4M15 3h4a2 2 0 012 2v4M9 21H5a2 2 0 01-2-2v-4M15 21h4a2 2 0 002-2v-4"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3.5"
                    stroke="white"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M8.5 9.5C9.2 8.3 10.5 7.5 12 7.5s2.8.8 3.5 2"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8.5 14.5C9.2 15.7 10.5 16.5 12 16.5s2.8-.8 3.5-2"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="text-white font-black text-2xl mb-1 relative z-10">
                Verify Your Face
              </p>
              <p className="text-white/70 text-sm text-center relative z-10">
                Take a live selfie to verify your identity
              </p>
            </div>

            <div className="w-full bg-white rounded-3xl shadow-sm p-5 mb-4">
              <p className="font-bold text-gray-800 text-sm mb-4">
                Before you start
              </p>
              <div className="space-y-3">
                {[
                  {
                    emoji: "💡",
                    title: "Good Lighting",
                    desc: "Ensure your face is well lit from the front",
                  },
                  {
                    emoji: "👁️",
                    title: "Face the Camera",
                    desc: "Look directly into the camera lens",
                  },
                  {
                    emoji: "🕶️",
                    title: "Remove Eyewear",
                    desc: "Remove glasses or hats if possible",
                  },
                  {
                    emoji: "😐",
                    title: "Neutral Expression",
                    desc: "Keep a calm, neutral expression",
                  },
                ].map((tip) => (
                  <div key={tip.title} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 text-lg">
                      {tip.emoji}
                    </div>
                    <div>
                      <p className="text-gray-700 font-semibold text-sm">
                        {tip.title}
                      </p>
                      <p className="text-gray-400 text-xs">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="w-full rounded-2xl p-4 flex gap-3 mb-5"
              style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="flex-shrink-0 mt-0.5"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
                <path
                  d="M12 8v4M12 16h.01"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-blue-600 text-xs leading-relaxed">
                If a picker appears, select{" "}
                <strong className="text-blue-700">"Camera"</strong> to take a
                live selfie.
              </p>
            </div>

            <button
              onClick={openCamera}
              className="w-full py-4 rounded-2xl text-white font-black text-base transition-transform active:scale-95"
              style={{
                background: "linear-gradient(90deg,#10b981,#0d9488)",
                boxShadow: "0 8px 24px rgba(16,185,129,0.4)",
              }}
            >
              📷 Take Selfie
            </button>
          </div>
        )}

        {/* ── GALLERY ERROR ── */}
        {step === "gallery_error" && (
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <div className="w-28 h-28 rounded-full mb-6 flex items-center justify-center bg-orange-100">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="26" fill="#ffedd5" />
                <path
                  d="M28 18v12M28 34h.01"
                  stroke="#f97316"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="font-black text-gray-900 text-xl mb-2 text-center">
              Live Photo Required
            </p>
            <p className="text-gray-500 text-sm text-center leading-relaxed mb-5 px-4">
              You selected a photo from your gallery. Please take a live selfie
              using your camera.
            </p>
            <div
              className="w-full rounded-2xl p-4 mb-8 text-left"
              style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
            >
              <p className="text-blue-700 text-xs font-bold mb-3">
                How to take a live selfie:
              </p>
              <div className="space-y-2.5">
                {[
                  "Tap 'Try Again' below",
                  "When the picker appears, choose 'Camera'",
                  "Take a fresh selfie with your front camera",
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 text-xs font-black">
                      {i + 1}
                    </div>
                    <p className="text-blue-600 text-xs">{s}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setErrorMsg("");
                  setStep("intro");
                }}
                className="flex-1 py-3.5 rounded-2xl text-white font-bold text-sm transition-transform active:scale-95"
                style={{ background: "linear-gradient(90deg,#10b981,#0d9488)" }}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* ── PREVIEW ── */}
        {step === "preview" && capturedImage && (
          <div className="flex flex-col">
            <div className="bg-white rounded-3xl shadow-sm p-4 mb-4">
              <p className="font-bold text-gray-800 text-sm text-center mb-3">
                Does this look good?
              </p>
              <div
                className="relative rounded-2xl overflow-hidden bg-black"
                style={{ height: 420 }}
              >
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={retake}
                className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm"
              >
                🔄 Retake
              </button>
              <button
                onClick={submitFace}
                className="flex-1 py-3.5 rounded-2xl text-white font-bold text-sm transition-transform active:scale-95"
                style={{ background: "linear-gradient(90deg,#10b981,#0d9488)" }}
              >
                ✓ Submit
              </button>
            </div>
          </div>
        )}

        {/* ── UPLOADING ── */}
        {step === "uploading" && (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div
              className="w-24 h-24 rounded-full mb-6 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#10b981,#0d9488)" }}
            >
              <svg
                className="animate-spin"
                width="36"
                height="36"
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
            </div>
            <p className="font-black text-gray-800 text-xl mb-2">
              Uploading...
            </p>
            <p className="text-gray-400 text-sm text-center">
              Please wait while we process your photo
            </p>
          </div>
        )}

        {/* ── DONE (after submit) ── */}
        {step === "done" && (
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <div className="w-28 h-28 rounded-full mb-6 flex items-center justify-center bg-emerald-100">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="26" fill="#d1fae5" />
                <path
                  d="M16 28l9 9 17-17"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="font-black text-gray-900 text-2xl mb-2">Submitted!</p>
            <p className="text-gray-500 text-sm text-center leading-relaxed mb-10 px-6">
              Your face photo has been submitted successfully. Our team will
              verify your identity shortly.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="w-full py-4 rounded-2xl text-white font-black text-base transition-transform active:scale-95"
              style={{
                background: "linear-gradient(90deg,#10b981,#0d9488)",
                boxShadow: "0 8px 24px rgba(16,185,129,0.4)",
              }}
            >
              Done
            </button>
          </div>
        )}

        {/* ── ERROR ── */}
        {step === "error" && (
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <div className="w-28 h-28 rounded-full mb-6 flex items-center justify-center bg-red-100">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="26" fill="#fee2e2" />
                <path
                  d="M28 18v12M28 34h.01"
                  stroke="#ef4444"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="font-black text-gray-900 text-xl mb-2">
              Upload Failed
            </p>
            <p className="text-gray-500 text-sm text-center mb-8 px-4">
              {errorMsg}
            </p>
            <div className="w-full flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setErrorMsg("");
                  setStep("intro");
                }}
                className="flex-1 py-3.5 rounded-2xl text-white font-bold text-sm transition-transform active:scale-95"
                style={{ background: "linear-gradient(90deg,#10b981,#0d9488)" }}
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceVerification;
