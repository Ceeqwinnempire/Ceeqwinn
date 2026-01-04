// ================================
// 🔒 CORE STATE (STABLE)
// ================================
let sentenceStack = [];

const NEGATIVE_PROMPT =
  "⚠️ Negative Prompt: deformed body, extra limbs, extra fingers, watermark, distorted face, missing limbs, fused hands, double head, blurry skin, long neck, broken joints, warped anatomy, text, logo, grain, frame, distortion, cartoonish face, 3D plastic skin, dull lighting, messy background, low quality, cropped, bad anatomy, duplicate limbs, blurred details, out of frame generation, oversharpening";

// ================================
// 🧠 INPUT LISTENER (RESTORED)
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
// ================================
function addSentenceFromButton() {
  const input = document.getElementById("sentenceInput");
  if (!input) return;
  addSentence(input.value);
  input.value = "";
}

function addSentence(sentence) {
  if (!sentence || !sentence.trim()) return;
  sentenceStack.push(sentence.trim());
  compilePrompt();
  renderSentenceLog();
}

// ================================
// ⏪ STACK CONTROL
// ================================
function deleteLastSentence() {
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
// 📜 SENTENCE LOG
// ================================
function renderSentenceLog() {
  const log = document.getElementById("sentenceLog");
  if (!log) return;
  log.innerHTML = sentenceStack.map((s, i) => `${i + 1}. ${s}`).join("<br>");
}

// ================================
// 🧩 PROMPT COMPILER (V1 FIX)
// Purpose:
// - Prevents JS crash
// - Restores sentence adding
// - Displays assembled prompt
// ================================
function compilePrompt() {
  const output = document.getElementById("promptOutput");
  if (!output) return;
  output.textContent = sentenceStack.join(", ");
}

// ================================
// 📦 COPY / PACKAGE PROMPT (STABLE)
// ================================
function copyPrompt() {
  const visible = document.getElementById("promptOutput").textContent;
  if (!visible) return;

  const full = visible + ". " + NEGATIVE_PROMPT;
  const textarea = document.createElement("textarea");
  textarea.value = full;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";

  document.body.appendChild(textarea);
  textarea.select();

  try { document.execCommand("copy"); } catch (err) { console.warn(err); }

  document.body.removeChild(textarea);
}

