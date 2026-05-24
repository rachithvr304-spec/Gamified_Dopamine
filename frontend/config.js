// ============================================================================
// FIREBASE CONFIGURATION — REMOVED (not used, API keys moved to backend)
// ============================================================================

// Firebase configuration removed - use backend endpoints instead

// ============================================================================
// GEMINI API CONFIGURATION — PRIMARY / SECONDARY FALLBACK
// ============================================================================

// API Base URL: use current origin (works on Netlify, localhost, GitHub Pages)
window.AOI_API_BASE_URL = window.location.origin;

// API keys are server-side only (not exposed in frontend)
window.AOI_GEMINI_MODEL = "gemini-2.5-flash";

// ============================================================================
// INITIALIZE FIREBASE — DISABLED (not used in Netlify architecture)
// ============================================================================

// Firebase initialization removed - using Netlify Functions backend instead
if (typeof firebase !== 'undefined') {
  console.log("ℹ️  Firebase SDK detected but not used. Using Netlify Functions for backend.");
} else {
  console.log("ℹ️  Firebase SDK not loaded. Using Netlify Functions backend instead.");
}
window.firebaseDB = null;
window.firebaseAuth = null;
console.log("✅ Gemini API key configured with primary/secondary fallback");
