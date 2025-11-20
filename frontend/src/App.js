import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "./i18n";

const LANG_LABELS = {
  en: "English",
  hi: "Hindi",
  es: "Spanish",
  pt: "Portuguese",
  zh: "Chinese",
  fr: "French",
};

const EMAIL_LANGS = ["fr", "es", "zh"];
const MOBILE_LANGS = ["hi", "pt"];

function App() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [currentLang, setCurrentLang] = useState(localStorage.getItem("lng") || "en");
  const [pendingLang, setPendingLang] = useState(null);
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpChannel, setOtpChannel] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    // Load user from backend
    fetch("http://localhost:5000/api/user/1")
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        const lang = localStorage.getItem("lng") || data.preferred_language || "en";
        setCurrentLang(lang);
        i18n.changeLanguage(lang);
        localStorage.setItem("lng", lang);
      })
      .catch((err) => {
        console.error("Error loading user", err);
      });
  }, []);

  const handleLanguageClick = async (lang) => {
    if (!user) return;
    setStatus({ type: "", message: "" });

    if (lang === currentLang) return;

    try {
      const res = await fetch("http://localhost:5000/api/request-language-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, newLanguage: lang }),
      });

      const data = await res.json();

      if (res.ok && data.requiresOtp) {
        setPendingLang(lang);
        setOtp("");
        setOtpChannel(data.channel);
        setShowOtpModal(true);
      } else if (res.ok && !data.requiresOtp) {
        const newLang = data.preferredLanguage || lang;
        applyLanguage(newLang);
        setStatus({ type: "success", message: `Language changed to ${LANG_LABELS[newLang]}` });
      } else {
        setStatus({ type: "error", message: data.message || "Something went wrong" });
      }
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: "Network error" });
    }
  };

  const applyLanguage = (lang) => {
    setCurrentLang(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem("lng", lang);
    setUser((prev) => (prev ? { ...prev, preferred_language: lang } : prev));
  };

  const handleVerifyOtp = async () => {
    if (!user || !otp) return;
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch("http://localhost:5000/api/verify-language-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, otp }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const newLang = data.preferredLanguage || pendingLang;
        setShowOtpModal(false);
        setPendingLang(null);
        setOtp("");
        applyLanguage(newLang);
        setStatus({ type: "success", message: data.message || "Language changed successfully" });
      } else {
        setStatus({ type: "error", message: data.message || "Invalid OTP" });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Network error" });
    }
  };

  const renderOtpChannelHelper = () => {
    if (!otpChannel) return null;
    if (otpChannel === "email") {
      return (
        <p className="helper-text">
          We have sent an OTP to your registered <strong>email</strong>. Enter it here to continue.
        </p>
      );
    }
    return (
      <p className="helper-text">
        We have sent an OTP to your registered <strong>mobile number</strong>. Enter it here to continue.
      </p>
    );
  };

  return (
    <div className="app-container">
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>

      <div style={{ marginTop: 24 }}>
        <h3>{t("current_language")}: {LANG_LABELS[currentLang]}</h3>
        <div className="language-buttons">
          {Object.entries(LANG_LABELS).map(([code, label]) => {
            const badges = [];
            if (EMAIL_LANGS.includes(code)) badges.push("Email OTP");
            if (MOBILE_LANGS.includes(code)) badges.push("Mobile OTP");

            return (
              <button
                key={code}
                className={`lang-btn ${currentLang === code ? "active" : ""}`}
                onClick={() => handleLanguageClick(code)}
              >
                {label}
                {badges.map((b) => (
                  <span key={b} className="badge">{b}</span>
                ))}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h2>{t("sample_content_title")}</h2>
        <p>{t("sample_paragraph")}</p>
      </div>

      {status.message && (
        <div className={`alert ${status.type === "error" ? "error" : "success"}`}>
          {status.message}
        </div>
      )}

      {showOtpModal && (
        <div className="otp-modal-backdrop">
          <div className="otp-modal">
            <h3>{t("otp_title")}</h3>
            {renderOtpChannelHelper()}
            <input
              className="otp-input"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
            />
            <div className="button-row">
              <button className="btn-secondary" onClick={() => setShowOtpModal(false)}>
                {t("cancel")}
              </button>
              <button className="btn-primary" onClick={handleVerifyOtp}>
                {t("verify")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;