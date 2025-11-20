const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://multilang-app-iota.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

// ----- Simple in-memory "DB" -----
let user = {
  id: "1",
  name: "Demo User",
  email: "demo@example.com",
  mobile: "+911234567890",
  preferred_language: "en",
  pending_language: null,
  language_otp: null,
  otp_expiry: null
};

// Languages that require different verification channels
const emailLanguages = ["fr"];
const mobileLanguages = ["en", "hi", "es", "pt", "zh"];

// Utility to generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// For demo we just log OTP to console.
// In real project, integrate actual providers here.
function sendEmailOtp(email, otp) {
  console.log(`\n[EMAIL OTP] Sending OTP ${otp} to email: ${email}\n`);
}

function sendSmsOtp(mobile, otp) {
  console.log(`\n[SMS OTP] Sending OTP ${otp} to mobile: ${mobile}\n`);
}

// Get user (for frontend initial load)
app.get("/api/user/:id", (req, res) => {
  if (req.params.id !== user.id) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    preferred_language: user.preferred_language
  });
});

// Request language change (send OTP if needed)
app.post("/api/request-language-change", (req, res) => {
  const { userId, newLanguage } = req.body;

  if (!userId || !newLanguage) {
    return res.status(400).json({ message: "userId and newLanguage are required" });
  }

  if (userId !== user.id) {
    return res.status(404).json({ message: "User not found" });
  }

  // If user selects same language, no change
  if (newLanguage === user.preferred_language) {
    return res.json({ requiresOtp: false, preferredLanguage: user.preferred_language });
  }

  // Determine verification channel
  let channel = null;
  if (emailLanguages.includes(newLanguage)) channel = "email";
  if (mobileLanguages.includes(newLanguage)) channel = "mobile";

  // English (en) or any language not requiring OTP
  if (!channel) {
    user.preferred_language = newLanguage;
    user.pending_language = null;
    user.language_otp = null;
    user.otp_expiry = null;

    console.log(`[LANG CHANGE] Directly changed language to ${newLanguage}`);

    return res.json({
      requiresOtp: false,
      preferredLanguage: user.preferred_language
    });
  }

  // Generate and store OTP
  const otp = generateOtp();
  const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

  user.pending_language = newLanguage;
  user.language_otp = otp;
  user.otp_expiry = expiry;

  if (channel === "email") {
    sendEmailOtp(user.email, otp);
  } else {
    sendSmsOtp(user.mobile, otp);
  }

  console.log(`[LANG CHANGE] OTP generated for language ${newLanguage}, channel: ${channel}`);

  res.json({
    requiresOtp: true,
    channel,
    otp,
    message: `OTP sent via ${channel}`
  });
});

// Verify OTP
app.post("/api/verify-language-otp", (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({ message: "userId and otp are required" });
  }

  if (userId !== user.id) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!user.language_otp || !user.pending_language) {
    return res.status(400).json({ message: "No pending language change" });
  }

  if (Date.now() > user.otp_expiry) {
    return res.status(400).json({ success: false, message: "OTP expired" });
  }

  if (otp !== user.language_otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  // OTP is valid → update preferred language
  user.preferred_language = user.pending_language;
  user.pending_language = null;
  user.language_otp = null;
  user.otp_expiry = null;

  console.log(`[LANG CHANGE] OTP verified, language changed to ${user.preferred_language}`);

  res.json({
    success: true,
    preferredLanguage: user.preferred_language,
    message: "Language changed successfully"
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});