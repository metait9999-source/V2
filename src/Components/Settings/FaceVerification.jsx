import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import axios from "axios";
import { API_BASE_URL } from "../../api/getApiURL";
import { useUser } from "../../context/UserContext";

const DARK_BG = "#0a0a0f";
const DARK_CARD = "rgba(255,255,255,0.04)";
const DARK_BORDER = "rgba(255,255,255,0.07)";
const TEXT_PRIMARY = "#f1f5f9";
const TEXT_MUTED = "#64748b";

const FaceVerification = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useUser();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState("intro");
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user?.face_image) setStep("already_verified");
  }, [user]);

  const openCamera = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isFresh = Date.now() - file.lastModified < 60000;
    if (!isFresh) {
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
      const fd = new FormData();
      fd.append("user_id", user?.id);
      fd.append("documents", capturedFile, "face.jpg");
      await axios.post(`${API_BASE_URL}/users/face-verify`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await refreshUser(user?.id);

      setStep("done");
    } catch {
      setErrorMsg("Upload failed. Please check your connection and try again.");
      setStep("error");
    }
  };

  const btnPrimary = {
    fontSize: "4.5vw",
    background: "linear-gradient(90deg,#10b981,#0d9488)",
    boxShadow: "0 8px 24px rgba(16,185,129,0.4)",
    border: "none",
  };
  const btnOutline = {
    fontSize: "4vw",
    background: DARK_CARD,
    border: `2px solid ${DARK_BORDER}`,
    color: TEXT_MUTED,
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: DARK_BG }}>
      <Header pageTitle="Face Verification" />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex-1 flex flex-col px-4 py-5">
        {step === "already_verified" && (
          <div className="flex flex-col items-center">
            <div
              className="w-full rounded-3xl p-6 mb-5 flex flex-col items-center relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg,#10b981 0%,#059669 100%)",
              }}
            >
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 pointer-events-none"
                style={{
                  background: "#fff",
                  filter: "blur(40px)",
                  transform: "translate(30%,-30%)",
                }}
              />
              <div className="w-28 h-28 rounded-full mb-4 overflow-hidden border-4 border-white/40 shadow-xl">
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
              <p
                className="text-white font-black relative z-10"
                style={{ fontSize: "6vw", marginBottom: 4 }}
              >
                Verified ✓
              </p>
              <p
                className="text-white/70 text-center relative z-10"
                style={{ fontSize: "3.5vw" }}
              >
                Your face has been successfully verified
              </p>
            </div>

            <div
              className="w-full rounded-3xl p-5 mb-5"
              style={{
                background: DARK_CARD,
                border: `1px solid ${DARK_BORDER}`,
              }}
            >
              <div
                className="flex items-center gap-4 mb-5 pb-5"
                style={{ borderBottom: `1px solid rgba(255,255,255,0.06)` }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(16,185,129,0.15)" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="rgb(16,185,129)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p
                    className="font-bold"
                    style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
                  >
                    Face Verification Complete
                  </p>
                  <p
                    style={{ fontSize: "3vw", color: TEXT_MUTED, marginTop: 2 }}
                  >
                    Your identity has been submitted for review
                  </p>
                </div>
              </div>
              {[
                {
                  label: "Status",
                  value: "Submitted",
                  color: "rgb(16,185,129)",
                  bg: "rgba(16,185,129,0.12)",
                },
                {
                  label: "Method",
                  value: "Face Selfie",
                  color: "#818cf8",
                  bg: "rgba(99,102,241,0.12)",
                },
                {
                  label: "Submitted",
                  value: "Photo on file",
                  color: "#fbbf24",
                  bg: "rgba(245,158,11,0.12)",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between mb-3"
                >
                  <p style={{ fontSize: "3.5vw", color: TEXT_MUTED }}>
                    {row.label}
                  </p>
                  <span
                    className="px-3 py-1 rounded-full font-semibold"
                    style={{
                      fontSize: "3vw",
                      background: row.bg,
                      color: row.color,
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="w-full rounded-2xl p-4 flex gap-3 mb-5"
              style={{
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
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
                  stroke="rgb(16,185,129)"
                  strokeWidth="2"
                />
                <path
                  d="M12 8v4M12 16h.01"
                  stroke="rgb(16,185,129)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <p
                style={{
                  fontSize: "3.2vw",
                  color: "rgb(110,231,183)",
                  lineHeight: 1.6,
                }}
              >
                Your face photo has been submitted. Our team will review and
                verify your identity. You will be notified once verification is
                complete.
              </p>
            </div>

            <button
              onClick={() => setStep("intro")}
              className="w-full py-3.5 rounded-2xl font-semibold mb-3 transition-transform active:scale-95"
              style={btnOutline}
            >
              🔄 Re-submit Photo
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full py-4 rounded-2xl text-white font-black transition-transform active:scale-95"
              style={btnPrimary}
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
                className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 pointer-events-none"
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
              <p
                className="text-white font-black relative z-10"
                style={{ fontSize: "6vw", marginBottom: 4 }}
              >
                Verify Your Face
              </p>
              <p
                className="text-white/70 text-center relative z-10"
                style={{ fontSize: "3.5vw" }}
              >
                Take a live selfie to verify your identity
              </p>
            </div>

            <div
              className="w-full rounded-3xl p-5 mb-4"
              style={{
                background: DARK_CARD,
                border: `1px solid ${DARK_BORDER}`,
              }}
            >
              <p
                className="font-bold mb-4"
                style={{ fontSize: "4vw", color: TEXT_PRIMARY }}
              >
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
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "rgba(16,185,129,0.12)",
                        fontSize: "1.2rem",
                      }}
                    >
                      {tip.emoji}
                    </div>
                    <div>
                      <p
                        className="font-semibold"
                        style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
                      >
                        {tip.title}
                      </p>
                      <p style={{ fontSize: "3.2vw", color: TEXT_MUTED }}>
                        {tip.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="w-full rounded-2xl p-4 flex gap-3 mb-5"
              style={{
                background: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.2)",
              }}
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
                  stroke="#60a5fa"
                  strokeWidth="2"
                />
                <path
                  d="M12 8v4M12 16h.01"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <p
                style={{ fontSize: "3.2vw", color: "#93c5fd", lineHeight: 1.6 }}
              >
                If a picker appears, select{" "}
                <strong style={{ color: "#bfdbfe" }}>"Camera"</strong> to take a
                live selfie.
              </p>
            </div>

            <button
              onClick={openCamera}
              className="w-full py-4 rounded-2xl text-white font-black transition-transform active:scale-95"
              style={btnPrimary}
            >
              📷 Take Selfie
            </button>
          </div>
        )}

        {/* ── GALLERY ERROR ── */}
        {step === "gallery_error" && (
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <div
              className="w-28 h-28 rounded-full mb-6 flex items-center justify-center"
              style={{ background: "rgba(249,115,22,0.15)" }}
            >
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="26" fill="rgba(249,115,22,0.12)" />
                <path
                  d="M28 18v12M28 34h.01"
                  stroke="#f97316"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p
              className="font-black text-center mb-2"
              style={{ fontSize: "5.5vw", color: TEXT_PRIMARY }}
            >
              Live Photo Required
            </p>
            <p
              className="text-center leading-relaxed mb-5 px-4"
              style={{ fontSize: "3.5vw", color: TEXT_MUTED }}
            >
              You selected a photo from your gallery. Please take a live selfie
              using your camera.
            </p>
            <div
              className="w-full rounded-2xl p-4 mb-8"
              style={{
                background: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.2)",
              }}
            >
              <p
                className="font-bold mb-3"
                style={{ fontSize: "3.2vw", color: "#93c5fd" }}
              >
                How to take a live selfie:
              </p>
              <div className="space-y-2.5">
                {[
                  "Tap 'Try Again' below",
                  "When the picker appears, choose 'Camera'",
                  "Take a fresh selfie with your front camera",
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-black"
                      style={{
                        background: "rgba(59,130,246,0.2)",
                        color: "#60a5fa",
                        fontSize: "3vw",
                      }}
                    >
                      {i + 1}
                    </div>
                    <p style={{ fontSize: "3.2vw", color: "#93c5fd" }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-3.5 rounded-2xl font-semibold"
                style={btnOutline}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setErrorMsg("");
                  setStep("intro");
                }}
                className="flex-1 py-3.5 rounded-2xl text-white font-bold transition-transform active:scale-95"
                style={{ ...btnPrimary, fontSize: "4vw", boxShadow: "none" }}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {step === "preview" && capturedImage && (
          <div className="flex flex-col">
            <div
              className="rounded-3xl p-4 mb-4"
              style={{
                background: DARK_CARD,
                border: `1px solid ${DARK_BORDER}`,
              }}
            >
              <p
                className="font-bold text-center mb-3"
                style={{ fontSize: "4vw", color: TEXT_PRIMARY }}
              >
                Does this look good?
              </p>
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{ height: 420, background: "#000" }}
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
                className="flex-1 py-3.5 rounded-2xl font-semibold"
                style={btnOutline}
              >
                🔄 Retake
              </button>
              <button
                onClick={submitFace}
                className="flex-1 py-3.5 rounded-2xl text-white font-bold transition-transform active:scale-95"
                style={{ ...btnPrimary, fontSize: "4vw", boxShadow: "none" }}
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
            <p
              className="font-black mb-2"
              style={{ fontSize: "5.5vw", color: TEXT_PRIMARY }}
            >
              Uploading...
            </p>
            <p
              className="text-center"
              style={{ fontSize: "3.5vw", color: TEXT_MUTED }}
            >
              Please wait while we process your photo
            </p>
          </div>
        )}

        {/* ── DONE ── */}
        {step === "done" && (
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <div
              className="w-28 h-28 rounded-full mb-6 flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.15)" }}
            >
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="26" fill="rgba(16,185,129,0.15)" />
                <path
                  d="M16 28l9 9 17-17"
                  stroke="rgb(16,185,129)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p
              className="font-black mb-2"
              style={{ fontSize: "6vw", color: TEXT_PRIMARY }}
            >
              Submitted!
            </p>
            <p
              className="text-center leading-relaxed mb-10 px-6"
              style={{ fontSize: "3.5vw", color: TEXT_MUTED }}
            >
              Your face photo has been submitted successfully. Our team will
              verify your identity shortly.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="w-full py-4 rounded-2xl text-white font-black transition-transform active:scale-95"
              style={btnPrimary}
            >
              Done
            </button>
          </div>
        )}

        {/* ── ERROR ── */}
        {step === "error" && (
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <div
              className="w-28 h-28 rounded-full mb-6 flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.15)" }}
            >
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="26" fill="rgba(239,68,68,0.12)" />
                <path
                  d="M28 18v12M28 34h.01"
                  stroke="rgb(239,68,68)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p
              className="font-black mb-2"
              style={{ fontSize: "5.5vw", color: TEXT_PRIMARY }}
            >
              Upload Failed
            </p>
            <p
              className="text-center mb-8 px-4"
              style={{ fontSize: "3.5vw", color: TEXT_MUTED }}
            >
              {errorMsg}
            </p>
            <div className="w-full flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-3.5 rounded-2xl font-semibold"
                style={btnOutline}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setErrorMsg("");
                  setStep("intro");
                }}
                className="flex-1 py-3.5 rounded-2xl text-white font-bold transition-transform active:scale-95"
                style={{ ...btnPrimary, fontSize: "4vw", boxShadow: "none" }}
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
