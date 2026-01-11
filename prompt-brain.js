
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
function packagePrompt() {
  const outputEl = document.getElementById("promptOutput");
  if (!outputEl || !outputEl.textContent.trim()) return;

  const full = outputEl.textContent + ". " + NEGATIVE_PROMPT;

  const textarea = document.createElement("textarea");
  textarea.value = full;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";

  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand("copy");
    showPackageStatus();
  } catch (err) {
    console.warn("Copy failed:", err);
  }

  document.body.removeChild(textarea);
}

// ================================
// ✨ PACKAGE FEEDBACK (FLOATING • CANON)
// ================================
function showPackageStatus() {
  let status = document.getElementById("packageStatus");

  if (!status) {
    status = document.createElement("div");
    status.id = "packageStatus";
    status.textContent = "Prompt packaged ✓";

    // ✅ Anchor to viewport, not layout
    document.body.appendChild(status);
  }

  // Reset animation state
  status.classList.remove("visible");
  void status.offsetWidth; // force reflow

  // Show toast
  status.classList.add("visible");

  // Hide after 1.5 seconds
  setTimeout(() => {
    status.classList.remove("visible");
  }, 1500);
}

// ================================
// ✨ MAGIC ADD BUTTON (CANONICAL)
// ================================
document.addEventListener("DOMContentLoaded", () => {
  const magicBtn = document.getElementById("magicAddBtn");

  if (!magicBtn) return;

  magicBtn.addEventListener("click", () => {
    const input = document.getElementById("sentenceInput");
    if (!input || !input.value.trim()) return;

    addSentence(input.value.trim());
    input.value = "";
  });
});



