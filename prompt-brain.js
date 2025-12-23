// ================================
// 🔒 V1 CORE — DO NOT MODIFY
// ================================

let sentenceStack = [];

const NEGATIVE_PROMPT = "distortion, extra limbs, low quality, watermark, oversharpening
  ";

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

function addSentenceFromButton() {
  const input = document.getElementById("sentenceInput");
  addSentence(input.value);
  input.value = "";
}

function addSentence(sentence) {
  if (!sentence.trim()) return;
  sentenceStack.push(sentence.trim());
  compilePrompt();
  renderSentenceLog();
}

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

function renderSentenceLog() {
  const log = document.getElementById("sentenceLog");
  log.innerHTML = sentenceStack.map((s, i) => `${i + 1}. ${s}`).join("<br>");
}

function copyPrompt() {
  const visible = document.getElementById("promptOutput").textContent;
  if (!visible) return;

  const full = visible + ". " + NEGATIVE_PROMPT;
  navigator.clipboard.writeText(full);
}

// ================================
// 🧠 V2 SEMANTIC ENGINE — FINAL
// ================================

const SEMANTIC_MAP = {
  subject: ["girl", "woman", "girls", "women"],
  action: ["walking", "standing", "twirling", "smiling", "running"],
  wear: ["wearing", "dressed in", "clad in"],
  carry: ["holding", "carrying"],
  environment: ["rain", "desert", "forest", "moon", "mountain", "sky"],
  mood: ["calm", "power", "fantastic", "soft", "dark", "victorious"],
};

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

function classifySentence(sentence) {
  for (const [type, keywords] of Object.entries(SEMANTIC_MAP)) {
    if (keywords.some(k => sentence.includes(k))) return type;
  }
  return "descriptive";
}

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
        scene.subject = s.includes("girls") || s.includes("women")
          ? "group of young women"
          : "young woman";
        break;

      case "action":
        scene.actions.push(s);
        break;

      case "wear":
        scene.wearables.push(s.replace(/wearing|dressed in|clad in/, "").trim());
        break;

      case "carry":
        scene.carried.push(s.replace(/holding|carrying/, "").trim());
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

function buildPromptFromScene(scene) {
  return [
    scene.subject,
    scene.actions.join(", "),
    scene.environment.join(", "),
    scene.wearables.length ? "wearing " + scene.wearables.join(" and ") : "",
    scene.carried.length ? "carrying " + scene.carried.join(" and ") : "",
    scene.mood.join(", "),
    scene.descriptive.join(", "),
    "cinematic lighting",
    "high detail",
    "clean composition"
  ].filter(Boolean).join(", ");
}

// ================================
// 🎼 V2 BRIDGE (SAFE REPLACEMENT)
// ================================

function compilePrompt() {
  const scene = parseScene(sentenceStack);
  const visiblePrompt = buildPromptFromScene(scene);

  document.getElementById("promptOutput").textContent = visiblePrompt;
}

