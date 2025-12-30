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
// 🧠 INPUT LISTENER (KEYBOARD)
// Purpose:
// - Captures Enter key
// - Pushes sentence into stack
// ================================

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("sentenceInput");

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
  addSentence(input.value);
  input.value = "";
}

function addSentence(sentence) {
  if (!sentence.trim()) return;

  // Push raw sentence into memory
  sentenceStack.push(sentence.trim());

  // Rebuild prompt + refresh UI
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
    // --- V1 PACKAGE FEEDBACK ANIMATION ---
  const output = document.querySelector(".output");
  if (output) {
    output.classList.remove("packaged");
    void output.offsetWidth; // force reflow
    output.classList.add("packaged");

    setTimeout(() => {
      output.classList.remove("packaged");
    }, 1500);
  }

// ================================
// 🧠 V2 SEMANTIC ENGINE — FINAL
// Purpose:
// - Classifies sentences
// - Organizes prompt meaning
// - Enables harmony + structure
// ================================

// Keyword map for semantic classification
const SEMANTIC_MAP = {
  subject: ["girl", "woman", "girls", "women"],
  action: ["walking", "standing", "twirling", "smiling", "running"],
  wear: ["wearing", "dressed in", "clad in"],
  carry: ["holding", "carrying"],
  environment: ["rain", "desert", "forest", "moon", "mountain", "sky"],
  mood: ["calm", "power", "fantastic", "soft", "dark", "victorious"]
};

// ================================
// ✨ NORMALIZATION LAYER
// Purpose:
// - Corrects spelling
// - Cleans spacing
// - Prepares text for logic
// ================================

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/twrilling/g, "twirling")
    .replace(/frilld/g, "frilled")
    .replace(/aht/g, "hat")
    .replace(/glden/g, "golden")
    .replace(/\s+/g, " ")
    .trim();
}

// ================================
// 🏷️ SENTENCE CLASSIFIER
// Purpose:
// - Determines what a sentence represents
// ================================

function classifySentence(sentence) {
  for (const [type, keywords] of Object.entries(SEMANTIC_MAP)) {
    if (keywords.some(k => sentence.includes(k))) return type;
  }
  return "descriptive";
}

// ================================
// 🎭 SCENE PARSER
// Purpose:
// - Converts raw sentences into structured scene data
// ================================

function parseScene(sentences) {
  const scene = {
    subject: null,
    actions: [],
    wearables: [],
    carried: [],
    environment: [],
    mood: [],
    descriptive: []
  };

  sentences.forEach(raw => {
    const s = normalizeText(raw);
    const type = classifySentence(s);

    switch (type) {
      case "subject":
        scene.subject =
          s.includes("girls") || s.includes("women")
            ? "group of young women"
            : "young woman";
        break;

      case "action":
        scene.actions.push(s);
        break;

      case "wear":
        scene.wearables.push(
          s.replace(/wearing|dressed in|clad in/, "").trim()
        );
        break;

      case "carry":
        scene.carried.push(
          s.replace(/holding|carrying/, "").trim()
        );
        break;

      case "environment":
        scene.environment.push(s);
        break;

      case "mood":
        scene.mood.push(s);
        break;

      default:
        scene.descriptive.push(s);
    }
  });

  return scene;
}

// ================================
// 🧵 PROMPT COMPOSER
// Purpose:
// - Orders scene data into a clean prompt
// ================================

function buildPromptFromScene(scene) {
  return [
    scene.subject,
    scene.actions.join(", "),
    scene.environment.join(", "),
    scene.wearables.length
      ? "wearing " + scene.wearables.join(" and ")
      : "",
    scene.carried.length
      ? "carrying " + scene.carried.join(" and ")
      : "",
    scene.mood.join(", "),
    scene.descriptive.join(", "),
    "cinematic lighting",
    "high detail",
    "clean composition"
  ]
    .filter(Boolean)
    .join(", ");
}

// ================================
// 🎼 V2 BRIDGE (SAFE)
// Purpose:
// - Connects sentence stack → semantic engine → UI
// ================================

function compilePrompt() {
  const scene = parseScene(sentenceStack);
  const visiblePrompt = buildPromptFromScene(scene);
  document.getElementById("promptOutput").textContent = visiblePrompt;
}
