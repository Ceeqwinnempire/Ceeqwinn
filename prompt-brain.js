
// ================================
// 🔒 V1 CORE — DO NOT MODIFY
// Purpose:
// - Stores raw user sentences
// - Holds the permanent negative prompt
// - Handles input + stack control
// ================================

// Stores every sentence the user adds (in order)
let sentenceStack = [];

// Permanent negative prompt (always appended during packaging)
const NEGATIVE_PROMPT =
  "⚠️ Negative Prompt: deformed body, extra limbs, extra fingers, watermark, distorted face, missing limbs, fused hands, double head, blurry skin, long neck, broken joints, warped anatomy, watermark, text, logo, grain, frame, distortion, cartoonish face, 3D plastic skin, dull lighting, messy background, low quality, cropped, bad anatomy, duplicate limbs, blurred details, out of frame generation, distortion, extra limbs, low quality, watermark, oversharpening";

// ================================
// 🛡️ SAFETY HELPERS (V1.1)
// Purpose:
// - Prevent empty / duplicate pushes
// - Centralize validation
// ================================

function isValidSentence(sentence) {
  if (!sentence) return false;

  const cleaned = sentence.trim();
  if (cleaned.length < 3) return false;
  if (sentenceStack.includes(cleaned)) return false;

  return true;
}

// ================================
// 🧠 INPUT LISTENER (KEYBOARD)
// Purpose:
// - Captures Enter key
// - Pushes sentence into stack
// ================================

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("sentenceInput");

  if (!input) return;

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSentence(input.value);
      input.value = "";
    }
  });
});

// ================================
// ➕ SENTENCE ADDERS
// Purpose:
// - Add sentence via button or keyboard
// ================================

function addSentenceFromButton() {
  const input = document.getElementById("sentenceInput");
  if (!input) return;

  addSentence(input.value);
  input.value = "";
}

function addSentence(sentence) {
  if (!isValidSentence(sentence)) return;

  const cleaned = sentence.trim();
  sentenceStack.push(cleaned);

  compilePrompt();
  renderSentenceLog();
}

// ================================
// ⏪ STACK CONTROL
// Purpose:
// - Undo last sentence
// - Reset entire prompt
// ================================

function deleteLastSentence() {
  if (sentenceStack.length === 0) return;

  sentenceStack.pop();
  compilePrompt();
  renderSentenceLog();
}

function resetPrompt() {
  sentenceStack = [];
  document.getElementById("promptOutput").textContent = "";
  document.getElementById("sentenceLog").textContent = "";
}

// ================================
// 📜 SENTENCE LOG RENDERER
// Purpose:
// - Displays sentence history in UI
// ================================

function renderSentenceLog() {
  const log = document.getElementById("sentenceLog");
  log.innerHTML = sentenceStack
    .map((s, i) => `${i + 1}. ${s}`)
    .join("<br>");
}
// ================================
// 📦 COPY / PACKAGE PROMPT (MOBILE SAFE)
// Purpose:
// - Packages visible prompt + negatives
// - Copies safely on mobile & desktop
// ================================

function copyPrompt() {
  const visible = document.getElementById("promptOutput").textContent;
  if (!visible) return;

  // Final packaged prompt
  const full = visible + ". " + NEGATIVE_PROMPT;

  // Mobile-safe clipboard method
  const textarea = document.createElement("textarea");
  textarea.value = full;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";

  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  try {
    document.execCommand("copy");
  } catch (err) {
    console.warn("Copy failed", err);
  }

  document.body.removeChild(textarea);
}

// ================================
// 🧠 V2 SEMANTIC ENGINE — FINAL
// Purpose:
// - Classifies sentences
// - Organizes prompt meaning
// - Enables harmony + structure
// ================================

// Keyword map for semantic classification
const SEMANTIC


